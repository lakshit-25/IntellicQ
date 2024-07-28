"use client";

import { auth } from "@/firebase/main";
import {
  signOut,
} from "firebase/auth";
import React, { useState } from "react";
import styled from "styled-components";
import { HOME_ROUTE } from "@/lib/constants/route";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState({});

  // Get the current path from the router
  const currentPath = usePathname();

  // Define a function to check if a link is active
  const isActive = (path: string) => path === currentPath;

  const handleLogout = async (e: any) => {
    try {
      e.preventDefault();
      signOut(auth).then(() => {
        router.push("/guest");
      });
    } catch (err: any) {
      console.error("Firebase Auth Error:", err.code, err.message);
      toast("Authentication Error", {
        description: err.message,
      });
    }
  };

  return (
    <NavBar className="sticky top-0 z-50 flex items-center justify-between w-full h-16 px-24 border-b shrink-0 bg-gradient-to-b from-background/10 via-background/50 to-background/80 backdrop-blur-xl">
      <div className="flex items-center">
        <React.Suspense
          fallback={
            <div className="flex-1 overflow-auto justify-center items-center" />
          }
        >
          <Image
            src="/App Black.png"
            width={32}
            height={32}
            alt="Login Picture"
            className="logoImg mr-2"
          />
          <h1>
            <b>IntellicQ</b>
          </h1>
        </React.Suspense>
      </div>

      <nav className="py-2 px-2 hidden md:flex gap-2 justify-center items-baseline font-semibold text-slate-600">
        <Link
          className={`${
            isActive(HOME_ROUTE)
              ? "text-slate-800 bg-slate-700/[8%]"
              : "hover:text-slate-800 hover:bg-slate-700/[8%]"
          } px-4 py-2 rounded-full transition-colors duration-100 ease-out`}
          href={HOME_ROUTE}
        >
          Home
        </Link>
        <Link
          className={`${
            isActive("/upload")
              ? "text-slate-800 bg-slate-700/[8%]"
              : "hover:text-slate-800 hover:bg-slate-700/[8%]"
          } px-4 py-2 rounded-full transition-colors duration-100 ease-out`}
          href="/upload"
        >
          Upload
        </Link>
        <Link
          className={`${
            isActive("/leaderboard")
              ? "text-slate-800 bg-slate-700/[8%]"
              : "hover:text-slate-800 hover:bg-slate-700/[8%]"
          } px-4 py-2 rounded-full transition-colors duration-100 ease-out`}
          href="/leaderboard"
        >
          Leaderboard
        </Link>
      </nav>

      <div className="flex items-center">
        {/* {auth.currentUser ? (
          <UserMenu user={userInfo} />
        ) : (
          
        )} */}
        <div className="px-3 pb-px shadow-button-light select-none active:shadow-none active:ring-[0.5px] active:ring-zinc-900/10 inline-flex items-center justify-center whitespace-nowrap text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border-[0.5px] border-black/15 h-8 sm:h-8 bg-white text-slate-800 hover:text-black hover:border-transparent hover:bg-slate-700/[8%] font-semibold rounded-lg group-[.stuck]:hover:bg-gray-700 group-[.stuck]:active:bg-gray-900 group-[.stuck]:bg-black group-[.stuck]:text-white shadow-none group-[.stuck]:border-transparent active:bg-gray-300 -translate-y-0.5 flex flex-row">
          <button
            onClick={handleLogout}
            className="flex gap-1 items-center justify-center"
          >
            Logout
          </button>
        </div>
      </div>
    </NavBar>
  );
}

const NavBar = styled.header``;
