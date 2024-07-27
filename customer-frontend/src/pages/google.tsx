import { useAuthCallback } from "@mysten/enoki/react";
import { useEffect, useState } from "react";

function Google() {
  const [loadingDots, setLoadingDots] = useState(0);
  const { handled } = useAuthCallback();

  useEffect(() => {
    setInterval(() => {
      setLoadingDots((prev) => (prev + 1) % 4);
    }, 10);

    if (handled) {
      // Get access token, perform security checks,
      // manage user session, handle errors, and so on.
      window.location.href = "/";
    }
  }, [handled]);

  return (
    <div className="h-screen flex flex-col gap-4 justify-center text-center items-center bg-sea">
      <span className="text-4xl font-bold">
        Redirecting{".".repeat(Math.floor((Date.now() % 2700) / 800))}
      </span>
      <div>
        <p className="text-xl">Please wait a moment</p>
        <p className="text-xl">while we sign you in</p>
      </div>
    </div>
  );
}

export default Google;
