import { useEffect, useState } from "react";
import { collection, onSnapshot, DocumentData } from "firebase/firestore";
import { db } from "@/firebase/main";
import { ArrowRight, Search } from "react-feather";
import styled from "styled-components";
import Header from "../ui/navbar";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface Video {
  id: string;
  vid_name: string;
  vid_url: string;
  vid_tags: string[];
}

export function HomeBody() {
  const router = useRouter();
  const [videos, setVideos] = useState<Video[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "Videos"), (snapshot) => {
      const videoList: Video[] = [];
      const tagSet: Set<string> = new Set();

      snapshot.forEach((doc) => {
        const data = doc.data() as DocumentData;
        const video: Video = {
          id: doc.id,
          vid_name: data.vid_name,
          vid_url: data.vid_url,
          vid_tags: data.vid_tags,
        };
        videoList.push(video);

        data.vid_tags.forEach((tag: string) => {
          tagSet.add(tag);
        });
      });

      setTags(Array.from(tagSet));
      setVideos(videoList);
    });

    return () => unsubscribe();
  }, []);

  const filterVideosByTag = (tag: string) => {
    const filteredVideos = videos.filter((video) =>
      video.vid_tags.includes(tag)
    );
    console.log(filteredVideos);
    setVideos(filteredVideos); // Update the displayed videos based on the selected tag
  };

  const navigateToVideoDetail = (id: string) => {
    router.push(`/videodetail/${id}`); // Redirect to the dynamic page with video ID as a slug
  };

  return (
    <HomeMain className="flex flex-1 flex-col items-center">
      <Header />
      <div className={cn("pb-[200px] pt-4 flex-1 md:pt-10")}>
        <div className="flex flex-row items-center gap-1 overflow-visible rounded-lg bg-white py-2 px-2 pl-2.5 pr-4 focus-within:ring-primary ring-1 ring-zinc-200 focus-within:shadow-input focus-within:shadow-primary/10 shadow-md transition-shadow">
          <input
            className="text-base min-w-[15rem] text-zinc-800 font-medium pl-1 caret-primary grow-1 peer w-full outline-none"
            type={"text"}
            name="input"
            required
            placeholder="Enter your Search"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <span className="icon">{<Search />}</span>
        </div>

        <div className="flex flex-col items-center">
          <div className="flex flex-wrap gap-2 my-4">
            {tags.map((tag) => (
              <div
                key={tag}
                className="shadow-button-light select-none active:shadow-none active:ring-[0.5px] active:ring-zinc-900/10 inline-flex items-center justify-center whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border-[0.5px] border-zinc-400/40 h-8 sm:h-8 mt-7 mb-5 bg-gray-100 border-none text-black text-[1.1rem] pt-5 px-6 pb-[1.4rem] rounded-xl shadow-none font-semibold hover:bg-gray-200/75 active:bg-gray-200"
                onClick={() => filterVideosByTag(tag)}
              >
                {tag}
              </div>
            ))}
          </div>
          <div className="grid w-full grid-cols-1 gap-4">
            {videos.map((video) => (
              <div
                key={video.id}
                className="md:rounded-xl border-y-2 md:border-2 border-zinc-100 md:bg-gradient-to-b from-white from-50% to-gray-100/60 flex items-center p-8 md:p-8 justify-between gap-8 cursor-pointer"
                onClick={() => navigateToVideoDetail(video.id)}
              >
                <h2 className="text-balance">{video.vid_name}</h2>
                <ArrowRight />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* <InputBox
        input={input}
        setInput={setInput}
        onSubmit={(value: string) => {
          // Implement your message submission logic here
        }}
        isLoading={isLoading}
      /> */}
    </HomeMain>
  );
}

const HomeMain = styled.section`
  h2 {
    font-weight: 600;
    font-size: 1.125rem;
    line-height: 1.75rem;
  }

  .midField {
    width: 90%;
    form {
      font-size: 0.8rem;
      margin-top: 1.5em;
      h3 {
        font-size: 0.9rem;
        cursor: pointer;
        font-weight: 700;

        &:hover {
          text-decoration: underline;
        }
      }
      .name {
        margin-bottom: 1.2rem;
        p {
          font-size: 18;
          font-weight: 500;
          margin-bottom: 8px;
          color: #4a5568;
        }
        .icon {
          color: #4a5568;
          cursor: pointer;
          svg {
            width: 24px;
          }
        }
      }
      .sub {
        margin-top: 0.8rem;
        button {
          font-weight: 700;
          color: #e8e8e8;
          background-color: #101727;
          border-radius: 10px;
        }
        p {
          margin-top: 2em;
          color: red;
        }
      }
    }
  }

  .lfmfooter {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    justify-content: center;
    p {
      font-size: 0.9rem;

      span {
        font-size: 0.9rem;
        cursor: pointer;
        font-weight: 700;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  }
`;
