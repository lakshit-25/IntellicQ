from flask import Flask, jsonify, request
from werkzeug.utils import secure_filename
import os
import assemblyai as aai
import re
from openai import OpenAI
from datetime import datetime
from flask_cors import CORS
from firebase_admin import credentials, firestore, storage, initialize_app
# import anthropic

# client = anthropic.Anthropic(
#     # defaults to os.environ.get("ANTHROPIC_API_KEY")
#     api_key="",
# )

# Initialize Firebase
cred = credentials.Certificate('fb-admin.json')
initialize_app(cred, {'storageBucket': 'intellectiq-668b4.appspot.com'})
db = firestore.client()

os.environ["OPENAI_API_KEY"] = ""
client = OpenAI(
    api_key=os.environ.get("OPENAI_API_KEY")
)

app = Flask(__name__)
CORS(app)

# Set the API key
aai.settings.api_key = ""
transcriber = aai.Transcriber()

# Set upload folder
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'mp4'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Function to check if file extension is allowed
def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Function to clean and format the transcription text
def clean_transcription(text):
    # Remove any extra spaces
    text = re.sub(r'\s+', ' ', text).strip()
    
    # Capitalize the first letter of each sentence
    sentences = re.split(r'([.!?] *)', text)
    text = ''.join([sent.capitalize() for sent in sentences])
    
    # Add a newline after each sentence
    text = re.sub(r'([.!?])', r'\1\n', text).strip()
    
    return text

def preprocess_quiz_string(quiz_string, quiz_ref):
    # Split the string into individual questions
    questions = re.split(r'\n\n+', quiz_string.strip())

    # Process each question
    for question in questions:
        # Extract question, options, WATS, and RS
        match = re.match(r"Q\d+: (.+) \nA: (.+) \nB: (.+) \nC: (.+) \nD: (.+) \nWATS: \[(\d+:\d+)\] \nRS: (\d+)", question)
        match2 = re.match(r"Q\d+: (.+)\nA: (.+)\nB: (.+)\nC: (.+)\nD: (.+)\nWATS: \[(\d+:\d+)\]\nRS: (\d+)", question)
        if match:
            quiz_ques = match.group(1)
            quiz_option = [match.group(2), match.group(3), match.group(4), match.group(5)]
            quiz_wats = match.group(6)
            quiz_rs = int(match.group(7))  # Convert RS to letter (A, B, C, D)
            quizs_data = {
                "quiz_ques": quiz_ques,
                "quiz_option": quiz_option,
                "quiz_wats": quiz_wats,
                "quiz_rs": quiz_rs
            }
            print(quizs_data)
            quiz_ref.add(quizs_data)
        elif match2:
            quiz_ques = match2.group(1)
            quiz_option = [match2.group(2), match2.group(3), match2.group(4), match2.group(5)]
            quiz_wats = match2.group(6)
            quiz_rs = int(match2.group(7))  # Convert RS to letter (A, B, C, D)
            quizs_data = {
                "quiz_ques": quiz_ques,
                "quiz_option": quiz_option,
                "quiz_wats": quiz_wats,
                "quiz_rs": quiz_rs
            }
            print(quizs_data)
            quiz_ref.add(quizs_data)

@app.route('/uploads', methods=['POST'])
def transcribe_video():
    try:
        # Check if the POST request has the file part
        if 'file' not in request.files:
            return jsonify({"error": "No file part"}), 400
        
        file = request.files['file']
        tags = request.form.getlist('tags[]') 
        
        # Check if the file is allowed
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)

            # Upload the file to Firebase Storage
            bucket = storage.bucket()
            blob = bucket.blob(f'videos/{filename}')
            blob.upload_from_filename(file_path)

            # Opt : if you want to make public access from the URL
            blob.make_public()

            # Get the uploaded video URL
            video_url = blob.public_url

            # Create a Firestore document for the video
            vid_ref = db.collection('Videos').document()
            vid_data = {
                'vid_name': filename,
                'vid_url': video_url,
                'vid_transcript': 'generating...',
                'vid_summary': 'generating...',
                'vid_tags': tags,
                'vid_id': vid_ref.id,
                'vid_createdDate': datetime.now()
            }
            vid_ref.set(vid_data)

            print("Part - 1 done")
            
            # Transcribe the audio from the uploaded video file
            transcript = transcriber.transcribe(file_path)
            
            # Split the transcript text into sentences
            sentences = transcript.text.strip().split('. ')
            
            # Generate timestamps for each sentence
            timestamps = []
            sentence_duration = 0

            for sentence in sentences:
                # Calculate the duration for this sentence
                sentence_duration += len(sentence.split()) / 5  # Average reading speed is 5 words per second
                
                # Convert sentence_duration to minutes and seconds
                duration_minutes = int(sentence_duration // 60)
                duration_seconds = int(sentence_duration % 60)
                
                # Format the timestamp
                timestamp_formatted = f"{duration_minutes:02}:{duration_seconds:02}"
                timestamps.append(timestamp_formatted)
            
            # Combine timestamps with sentences
            formatted_transcript = "\n".join([f"[{timestamps[i]}] {sent.capitalize()}." for i, sent in enumerate(sentences)])
            
            # Clean and format the transcription text
            formatted_transcript = clean_transcription(formatted_transcript)

            # Update the video document with the generated transcript
            vid_ref.update({'vid_transcript': formatted_transcript})

            print("Part - 2 done")

            # Generate a summary using OpenAI
            completion = client.chat.completions.create(
                messages=[
                    {"role": "system", "content": "You are a helpful educator."},
                    {"role": "user", "content": f"summarize this for the learning student: {transcript.text}"}
                ],
                model="gpt-3.5-turbo",
            )
            summary = completion.choices[0].message.content

            # Update the video document with the generated summary
            vid_ref.update({'vid_summary': summary})

            print("Part - 3 done")

            # Generate quiz questions using OpenAI
            completion = client.chat.completions.create(
                messages=[
                        {"role": "system", "content": "You are a helpful educator."},
                        {"role": "user", "content": f"generate 5 quiz questions for the learner using the transcript as context {transcript.text} using the strict format: 'Q(no): 'Question goes here?' A: 'Option 1 goes here' B: 'Option 2 goes here' C: 'Option 3 goes here' D: 'Option 4 goes here' WATS: 'Timestamp of the context which was used to create the question (for ex: [00:09]) format' RS: 'Option 0,1,2 or 3' \n'. in case of user choosing wrong answer, include the timestamp (WATS) used for the question and the correct answer in RS (0,1,2 or 3)"}
                ],
                model="gpt-3.5-turbo",
            )
            quizs = completion.choices[0].message.content

            # Create a subcollection for quizs in the video document
            quizs_ref = vid_ref.collection('Quizs')

            # use quizs which is the unfomatted data format it nd store it
            # pre process here for format
            print(quizs)
            preprocess_quiz_string(quizs, quizs_ref)

            print("Part - 4 done")

            # Delete the uploaded file after processing
            os.remove(file_path)
            
            return jsonify({"message": "Data successfully uploaded!", "quizs" : quizs})
        else:
            return jsonify({"error": "File type not allowed"}), 400

    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=8000, debug=True)