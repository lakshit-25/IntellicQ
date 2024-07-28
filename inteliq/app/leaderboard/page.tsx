"use client";

import { LeaderboardBody } from "@/components/leaderboard/lbbody";
import useAuthentication from "@/lib/hooks/useAuthentication";

export default function Leaderboard() {
  useAuthentication();
  return <LeaderboardBody />;
}
