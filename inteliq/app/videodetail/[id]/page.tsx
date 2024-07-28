"use client";

import { VideoBody } from "@/components/video/videobody";
import useAuthentication from "@/lib/hooks/useAuthentication";

export default function VideoDetail() {
  useAuthentication();
  return <VideoBody />;
}

