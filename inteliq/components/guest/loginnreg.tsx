"use client";

import { cn } from "@/lib/utils";
import { Swiper, SwiperSlide } from "swiper/react";
import { useRef, useState } from "react";
import { auth } from "@/firebase/main";
import { Eye, EyeOff } from "react-feather";
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
import Image from "next/image";
import styled from "styled-components";
import "swiper/css/bundle";
import useAuthentication from "@/lib/hooks/useAuthentication";

export default function LoginnReg() {
  useAuthentication();
  const swiperRef: any = useRef();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [passwordShown1, setPasswordShown1] = useState(false);
  const [mailsent, setMailSent] = useState("");

  const togglePassword1 = () => {
    // When the handler is invoked
    // inverse the boolean state of passwordShown
    setPasswordShown1(!passwordShown1);
  };

  const triggerResetEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await sendPasswordResetEmail(auth, email);
    setMailSent("Password reset email sent");
  };

  type ErrorMessage =
    | "Entered Password is Incorrect"
    | "No such User Exists!"
    | "Too many attempts, Try again later";

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Navigate to another page or do something else on successful login
    } catch (err: any) {
      let errorText: ErrorMessage;
      if (err.message == "Firebase: Error (auth/wrong-password).") {
        errorText = "Entered Password is Incorrect";
      } else if (err.message == "Firebase: Error (auth/user-not-found).") {
        errorText = "No such User Exists!";
      } else if (
        err.message ==
        "Firebase: Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later. (auth/too-many-requests)."
      ) {
        errorText = "Too many attempts, Try again later";
      }

      setError(() => errorText);
    }
  };

  const handleSignup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // Navigate to another page or do something else on successful login
    } catch (err: any) {
      let errorText: any;
      if (err.message == "weak-password") {
        errorText = "The password provided is too weak.";
      } else if (err.message == "email-already-in-use") {
        errorText = "The account already exists for that email.";
      } else {
        errorText = err.message;
      }

      setError(() => errorText); // Pass a function that returns errorText
    }
  };


  return (
    <LoginMain className="mx-auto max-w-2xl px-4">
      <div className="rounded-3xl border bg-background p-8 shadow-sm-light border-t-2 border-white before:content-[''] before:w-full before:h-full before:absolute before:bottom-0 before:border-b before:border-zinc-600/20 before:rounded-3xl before:z-0 mt-4">
        <Swiper
          slidesPerView={"auto"}
          allowTouchMove={false}
          modules={[]}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
        >
          <SwiperSlide>
            <div className="flex flex-col justify-center items-center">
              <Image
                src="/App Logo.png"
                width={80}
                height={80}
                alt="Login Picture"
                className="logoImg"
              />
              <h2 className="mt-2">IntellectiQ</h2>

              <h2 className="mt-8">Sign up</h2>

              <div className="midField">
                <form onSubmit={handleSignup}>
                  <div className="name">
                    <p>Email</p>
                    <div className="flex flex-row items-center gap-1 overflow-visible rounded-lg bg-white py-2 px-2 pl-2.5 pr-2 focus-within:ring-primary ring-1 ring-zinc-200 focus-within:shadow-input shadow-md transition-shadow">
                      <input
                        className="text-base min-w-[15rem] text-zinc-800 font-medium pl-1 caret-primary grow-1 peer w-full outline-none"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        required
                        name="email"
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="name">
                    <p>Password</p>
                    <div className="flex flex-row items-center gap-1 overflow-visible rounded-lg bg-white py-2 px-2 pl-2.5 pr-4 focus-within:ring-primary ring-1 ring-zinc-200 focus-within:shadow-input shadow-md transition-shadow">
                      <input
                        className="text-base min-w-[15rem] text-zinc-800 font-medium pl-1 caret-primary grow-1 peer w-full outline-none"
                        type={!passwordShown1 ? "password" : "text"}
                        name="password"
                        required
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <span className="icon" onClick={togglePassword1}>
                        {passwordShown1 ? <Eye /> : <EyeOff />}
                      </span>
                    </div>
                  </div>
                  <div className="sub">
                    <button
                      type="submit"
                      className="rounded-lg inline-flex font-medium w-full min-w-[18rem] leading-6 items-center justify-center gap-2 border border-zinc-200 py-2.5 pl-2.5 pr-2 pb-3 focus-within:ring-primary focus:ring-1 ring-0 ring-[#C9C9C9] focus-within:shadow-input scale-100 hover:scale-[1.015] active:scale-100 active:shadow-md shadow-md hover:shadow-lg duration-300 ease-in-out"
                    >
                      Signup
                    </button>
                    {error != null ? <p>{error}</p> : null}
                  </div>
                </form>

                <div className="lfmfooter">
                  <div className="z-10 flex w-full items-center gap-4 py-6">
                    <div className="h-px w-full bg-slate-300 shadow-[0_1px_0_0_rgba(255,255,255,0.75)]"></div>
                    <span className="text-sm font-semibold text-slate-500/75 drop-shadow-[0_1px_0_rgba(255,255,255,0.75)]">
                      OR
                    </span>
                    <div className="h-px w-full bg-slate-300 shadow-[0_1px_0_0_rgba(255,255,255,0.75)]"></div>
                  </div>
                  <p>
                    Already have an account?{" "}
                    <span onClick={() => swiperRef.current.slideNext()}>
                      Login!
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="flex flex-col justify-center items-center">
              <Image
                src="/App Logo.png"
                width={80}
                height={80}
                alt="Login Picture"
                className="logoImg"
              />
              <h2 className="mt-2">IntellectiQ</h2>

              <h2 className="mt-8">Sign in</h2>

              <div className="midField">
                <form onSubmit={handleLogin}>
                  <div className="name">
                    <p>Email</p>
                    <div className="flex flex-row items-center gap-1 overflow-visible rounded-lg bg-white py-2 px-2 pl-2.5 pr-2 focus-within:ring-primary ring-1 ring-zinc-200 focus-within:shadow-input shadow-md transition-shadow">
                      <input
                        className="text-base min-w-[15rem] text-zinc-800 font-medium pl-1 caret-primary grow-1 peer w-full outline-none"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        required
                        name="email"
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="name">
                    <p>Password</p>
                    <div className="flex flex-row items-center gap-1 overflow-visible rounded-lg bg-white py-2 px-2 pl-2.5 pr-4 focus-within:ring-primary ring-1 ring-zinc-200 focus-within:shadow-input shadow-md transition-shadow">
                      <input
                        className="text-base min-w-[15rem] text-zinc-800 font-medium pl-1 caret-primary grow-1 peer w-full outline-none"
                        type={!passwordShown1 ? "password" : "text"}
                        name="password"
                        required
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <span className="icon" onClick={togglePassword1}>
                        {passwordShown1 ? <Eye /> : <EyeOff />}
                      </span>
                    </div>
                  </div>
                  <h3 onClick={() => swiperRef.current.slideNext()}>
                    Forgot Password?{" "}
                  </h3>
                  <div className="sub">
                    <button
                      type="submit"
                      className="rounded-lg inline-flex font-medium w-full min-w-[18rem] leading-6 items-center justify-center gap-2 border border-zinc-200 py-2.5 pl-2.5 pr-2 pb-3 focus-within:ring-primary focus:ring-1 ring-0 ring-[#C9C9C9] focus-within:shadow-input scale-100 hover:scale-[1.015] active:scale-100 active:shadow-md shadow-md hover:shadow-lg duration-300 ease-in-out"
                    >
                      Login
                    </button>
                    {error != null ? <p>{error}</p> : null}
                  </div>
                </form>

                <div className="lfmfooter">
                  <div className="z-10 flex w-full items-center gap-4 py-6">
                    <div className="h-px w-full bg-slate-300 shadow-[0_1px_0_0_rgba(255,255,255,0.75)]"></div>
                    <span className="text-sm font-semibold text-slate-500/75 drop-shadow-[0_1px_0_rgba(255,255,255,0.75)]">
                      OR
                    </span>
                    <div className="h-px w-full bg-slate-300 shadow-[0_1px_0_0_rgba(255,255,255,0.75)]"></div>
                  </div>
                  <p>
                    First Time?{" "}
                    <span onClick={() => swiperRef.current.slidePrev()}>
                      Register Here!
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </SwiperSlide>
          <SwiperSlide className="main flex flex-col justify-center items-center">
            <div className="flex flex-col justify-center items-center">
              <Image
                src="/App Logo.png"
                width={80}
                height={80}
                alt="Login Picture"
                className="logoImg"
              />
              <h2 className="mt-2">IntellectiQ</h2>

              <h2 className="mt-8">Password Reset</h2>

              <div className="midField">
                <form onSubmit={triggerResetEmail}>
                  <div className="name">
                    <p>Email</p>
                    <div className="flex flex-row items-center gap-1 overflow-visible rounded-lg bg-white py-2 px-2 pl-2.5 pr-2 focus-within:ring-primary ring-1 ring-zinc-200 focus-within:shadow-input shadow-md transition-shadow">
                      <input
                        className="text-base min-w-[15rem] text-zinc-800 font-medium pl-1 caret-primary grow-1 peer w-full outline-none"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        required
                        name="email"
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="sub">
                    <button
                      type="submit"
                      className="rounded-lg inline-flex font-medium w-full min-w-[18rem] leading-6 items-center justify-center gap-2 border border-zinc-200 py-2.5 pl-2.5 pr-2 pb-3 focus-within:ring-primary focus:ring-1 ring-0 ring-[#C9C9C9] focus-within:shadow-input scale-100 hover:scale-[1.015] active:scale-100 active:shadow-md shadow-md hover:shadow-lg duration-300 ease-in-out"
                    >
                      Submit
                    </button>
                    {mailsent != null ? <p>{mailsent}</p> : null}
                  </div>
                </form>

                <div className="lfmfooter">
                  <div className="z-10 flex w-full items-center gap-4 py-6">
                    <div className="h-px w-full bg-slate-300 shadow-[0_1px_0_0_rgba(255,255,255,0.75)]"></div>
                    <span className="text-sm font-semibold text-slate-500/75 drop-shadow-[0_1px_0_rgba(255,255,255,0.75)]">
                      OR
                    </span>
                    <div className="h-px w-full bg-slate-300 shadow-[0_1px_0_0_rgba(255,255,255,0.75)]"></div>
                  </div>
                  <p>
                    Go back to{" "}
                    <span onClick={() => swiperRef.current.slideTo(1)}>
                      Login
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </SwiperSlide>
        </Swiper>
      </div>
    </LoginMain>
  );
}

const LoginMain = styled.section`
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

function IconArrowRight({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      fill="currentColor"
      className={cn("size-4", className)}
      {...props}
    >
      <path d="m221.66 133.66-72 72a8 8 0 0 1-11.32-11.32L196.69 136H40a8 8 0 0 1 0-16h156.69l-58.35-58.34a8 8 0 0 1 11.32-11.32l72 72a8 8 0 0 1 0 11.32Z" />
    </svg>
  );
}
