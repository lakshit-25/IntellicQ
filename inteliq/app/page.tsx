"use client"

import { HomeBody } from "@/components/home/hombody";
import useAuthentication from "@/lib/hooks/useAuthentication";

export default function Home() {
  useAuthentication();
  return <HomeBody  />;
}
