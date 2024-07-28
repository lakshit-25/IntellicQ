import { useEffect, useRef, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  query,
  getDocs,
  updateDoc,
  Timestamp,
  setDoc,
} from "firebase/firestore";
import { auth, db } from "@/firebase/main";
import Header from "../ui/navbar";
import { useParams } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import "swiper/css/bundle";
import { Button } from "../ui/button";
import { toast } from "react-toastify";

interface Video {
  id: string;
  vid_name: string;
  vid_url: string;
  vid_summary: string;
  vid_transcript: string;
}

interface QuizQuestion {
  id: string;
  vid_id: string;
  quiz_ques: string;
  quiz_option: string[];
  quiz_rs: number;
  quiz_wats: string;
}

export function VideoBody() {
  const params = useParams();
  const id = params.id;
  const swiperRef: any = useRef();
  const [videoData, setVideoData] = useState<Video | null>(null);
  const [quizData, setQuizData] = useState<QuizQuestion[]>([]);
  const [activeTab, setActiveTab] = useState<"summary" | "transcript">(
    "summary"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizPoints, setQuizPoints] = useState<number>(0);

  useEffect(() => {
    if (id) {
      const fetchVideoData = async () => {
        setIsLoading(true);
        try {
          const videoDocRef = doc(db, "Videos", id.toString());
          const videoDocSnapshot = await getDoc(videoDocRef);
          if (videoDocSnapshot.exists()) {
            setVideoData(videoDocSnapshot.data() as Video);
            // Fetch quiz data
            const quizQuery = query(
              collection(db, "Videos", id.toString(), "Quizs")
            );
            const quizSnapshot = await getDocs(quizQuery);
            const quizDataArray: QuizQuestion[] = [];
            quizSnapshot.forEach((doc) => {
              quizDataArray.push({ id: doc.id, ...doc.data() } as QuizQuestion);
            });
            setQuizData(quizDataArray);
          } else {
            console.error("Video document not found");
          }
        } catch (error) {
          console.error("Error fetching video data:", error);
        }
        setIsLoading(false);
      };

      fetchVideoData();
    }
  }, [id]);

  const handleTabClick = (tab: "summary" | "transcript") => {
    setActiveTab(tab);
  };

  const handleAnswerSelection = (index: number) => {
    if (selectedAnswer === null) {
      setSelectedAnswer(index);
    }
  };

  const handleNextQuestion = async () => {
    if (currentQuestionIndex < quizData.length - 1 && selectedAnswer !== null) {
      if (selectedAnswer === quizData[currentQuestionIndex].quiz_rs) {
        setQuizPoints((prevPoints) => prevPoints + 1);
      }
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      swiperRef.current.slideNext();
    } else if (
      currentQuestionIndex === quizData.length - 1 &&
      selectedAnswer !== null
    ) {
      if (selectedAnswer === quizData[currentQuestionIndex].quiz_rs) {
        setQuizPoints((prevPoints) => prevPoints + 1);
      }
      // Submit quiz and update leaderboard
      const leaderboardDocRef = doc(db, "Leaderboard", auth.currentUser!.uid);
      const leaderboardDoc = await getDoc(leaderboardDocRef);
      if (leaderboardDoc.exists()) {
        try {
          await updateDoc(leaderboardDocRef, {
            latest_points: quizPoints,
            last_updated: Timestamp.now(),
            user_id: auth.currentUser!.uid,
          });
          toast.success("Quiz submitted successfully - Check Leaderboard for update");
        } catch (error) {
          console.error("Error updating leaderboard:", error);
        }
      } else {
        try {
          await setDoc(leaderboardDocRef, {
            latest_points: quizPoints,
            last_updated: Timestamp.now(),
            user_id: auth.currentUser!.uid,
          });
          toast.success(
            "Quiz submitted successfully - Check Leaderboard for update"
          );
        } catch (error) {
          console.error("Error creating leaderboard document:", error);
        }
      }
    }
  };

  return (
    <Dialog>
      <main className="flex flex-1 flex-col items-center">
        <Header />
        <div className="mt-8 xs:mt-6 mx-8 xl:mx-0 flex flex-col text-center gap-3 max-w-lg pb-[200px]">
          {isLoading ? (
            <p>Loading...</p>
          ) : videoData ? (
            <>
              <video controls>
                <source src={videoData.vid_url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              {quizData.length > 0 && (
                <DialogTrigger asChild>
                  <Button variant="outline">Quizs Available</Button>
                </DialogTrigger>
              )}
              <div className="flex justify-center">
                <div
                  className={`cursor-pointer mr-4 ${
                    activeTab === "summary" ? "text-blue-600" : "text-gray-600"
                  }`}
                  onClick={() => handleTabClick("summary")}
                >
                  Summary
                </div>
                <div
                  className={`cursor-pointer ${
                    activeTab === "transcript"
                      ? "text-blue-600"
                      : "text-gray-600"
                  }`}
                  onClick={() => handleTabClick("transcript")}
                >
                  Transcript
                </div>
              </div>
              {activeTab === "summary" && (
                <div>
                  <h2>Summary:</h2>
                  <p>{videoData.vid_summary}</p>
                </div>
              )}
              {activeTab === "transcript" && (
                <div>
                  <h2>Transcript:</h2>
                  <p>{videoData.vid_transcript}</p>
                </div>
              )}
            </>
          ) : (
            <p>No video found</p>
          )}
        </div>
      </main>
      <DialogContent className="w-full">
        <Swiper
          slidesPerView={"auto"}
          allowTouchMove={false}
          modules={[]}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
            setSelectedAnswer(null);
          }}
          className="w-full"
        >
          {quizData.map((question, index) => (
            <SwiperSlide key={index}>
              <DialogHeader>
                <DialogTitle>Question - {index}</DialogTitle>
                <DialogDescription>{question.quiz_ques}</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {question.quiz_option.map((option, optionIndex) => (
                  <div
                    key={optionIndex}
                    onClick={() => handleAnswerSelection(optionIndex)}
                    className={`cursor-pointer w-full p-2 ${
                      selectedAnswer === optionIndex
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    {option}
                  </div>
                ))}
                {selectedAnswer !== null && (
                  <p>
                    Go to {question.quiz_wats} in the video to understand the
                    answer
                  </p>
                )}
              </div>
              <DialogFooter>
                {selectedAnswer !== null && (
                  <Button
                    variant="outline"
                    onClick={handleNextQuestion}
                    disabled={
                      currentQuestionIndex === quizData.length - 1 &&
                      selectedAnswer === null
                    }
                  >
                    {currentQuestionIndex === quizData.length - 1
                      ? "Submit Quiz"
                      : "Next Question"}
                  </Button>
                )}
              </DialogFooter>
            </SwiperSlide>
          ))}
        </Swiper>
      </DialogContent>
    </Dialog>
  );
}
