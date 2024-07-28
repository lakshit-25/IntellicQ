import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import Header from "../ui/navbar";
import { toast } from "react-toastify";

export function UploadBody() {
  const [file, setFile] = useState<File | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = () => {
    if (!file) {
      alert("Please select a file");
      return;
    }

    setIsLoading(true); // Set loading state to true at the beginning

    const formData = new FormData();
    formData.append("file", file);
    tags.forEach((tag) => formData.append("tags[]", tag)); // Append each tag as an array element

    fetch("http://127.0.0.1:8000/uploads", {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          toast.error("File Upload Failed! Try uploading the file again.");
        }
        return response.text();
      })
      .then((data) => {
        console.log(data);
        // File uploaded successfully, allow user to enter prompt
        toast.success("🦄 File has been uploaded & processed successfully");
      })
      .catch((error) => {
        toast.error("Error uploading file:", error.message);
      })
      .finally(() => {
        setIsLoading(false); // Set loading state to false after the fetch request has completed
      });
  };

  return (
    <main className="flex flex-1 flex-col items-center">
      <Header />
      <div className="mt-8 xs:mt-6 mx-8 xl:mx-0 flex flex-col text-center gap-3 max-w-lg pb-[200px]">
        <h1 className="mb-1 hero-h1-grad text-balance text-[5.5vw]/[115%] xs:text-xl font-bold xtext-slate-900 tracking-tight inline-block bg-clip-text z-20">
          Video Uploader
        </h1>

        <h2 className="text-balance text-[1.75vw]/[115%] xs:text-[1.7rem]/8 font-semibold text-[#b2b2bd] tracking-tight">
          Drop in your video down below and assign tags to it then hit that
          submit button.
        </h2>

        <div className="mt-8 flex items-center justify-center px-8">
          <Input
            id="picture"
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            accept="video/mp4,video/x-m4v,video/*"
          />
        </div>

        <div className="mt-1 flex flex-col items-center">
          <Input
            placeholder="Enter tags separated by commas"
            value={tags.join(",")}
            onChange={(e) =>
              setTags(e.target.value.split(",").map((tag) => tag.trim()))
            }
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!file || isLoading}
          className="mt-4"
        >
          {isLoading ? "Uploading..." : "Submit"}
        </Button>
      </div>
    </main>
  );
}
