import { useAuthCallback } from "@mysten/enoki/react";
import { useEffect, useState } from "react";
import { Image } from "@nextui-org/react";

function Google() {
  const [loadingDots, setLoadingDots] = useState(0);
  const { handled } = useAuthCallback();

  useEffect(() => {
    setInterval(() => {
      loadingDots;
      setLoadingDots((prev) => (prev + 1) % 4);
    }, 10);

    if (handled) {
      // Get access token, perform security checks,
      // manage user session, handle errors, and so on.
      console.log("User is signed in, redirecting to home page...");
      window.location.href = "/";
    }
  }, [handled]);

  return (
    <div className="h-screen flex flex-col gap-4 justify-center text-center items-center bg-sea">
      <Image src="/logo.png" width={80} />
      <span className="text-4xl font-bold text-cloud italic">
        Redirecting{".".repeat(Math.floor((Date.now() % 2700) / 800))}
      </span>
      <div className="text-xl font-semibold">
        <p>Please wait a moment</p>
        <p>while we sign you in</p>
      </div>
    </div>
  );
}

export default Google;
