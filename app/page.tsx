"use client";

import Shuffle from "@/components/shuffle";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    setTimeout(() => {
      router.push("/home")
    }, 2000)
  })
  return (
    <div className="w-full h-screen overflow-hidden  bg-[url('/error-background.webp')] bg-no-repeat bg-cover">
      <div className="w-full h-full bg-black/30 backdrop-blur-lg flex items-center justify-center flex-col">
        <Shuffle
          text="Whats Chat"
          shuffleDirection="right"
          duration={0.5}
          animationMode="evenodd"
          shuffleTimes={1}
          ease="power3.out"
          stagger={0.03}
          threshold={0.1}
          triggerOnce={true}
          colorFrom="#ffffff"
          colorTo="#FEDA34"
          loop={true}
          loopDelay={1}
        />
        CyberChat,你的API该更新了....
      </div>
    </div>
  );
}