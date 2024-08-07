import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/lib/hooks/auth";
import { ToastContainer } from "react-toastify";
import NextTopLoader from "nextjs-toploader";
import "react-toastify/dist/ReactToastify.css";
import StyledComponentsRegistry from "@/lib/registry";
import { cn } from "@/lib/utils";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default: "Research AI Chatbot",
    template: `%s - Research AI Chatbot`,
  },
  description: "An AI-powered chatbot template built with Next.js.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
        suppressHydrationWarning={true}
      >
        <NextTopLoader
          color="#2299DD"
          initialPosition={0.08}
          crawlSpeed={200}
          zIndex={1600}
          showAtBottom={false}
        />
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <main className="flex flex-col flex-1 bg-muted/50">
              <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
            </main>
          </div>
          <ToastContainer />
        </AuthProvider>
      </body>
    </html>
  );
}
