import { useAuthCallback, useEnokiFlow } from "@mysten/enoki/react";
import { useEffect, useState } from "react";
import { Image } from "@nextui-org/react";
import { useUser } from "../hooks/useUser";
import { useNavigate } from "react-router-dom";

function Google() {
  const [loadingDots, setLoadingDots] = useState(0);
  const { handled } = useAuthCallback();
  const enokiFlow = useEnokiFlow();
  const userContext = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    setInterval(() => {
      loadingDots;
      setLoadingDots((prev) => (prev + 1) % 4);
    }, 10);

    if (handled) {
      // Get access token, perform security checks,
      // manage user session, handle errors, and so on.
      // console.log("User is signed in, redirecting to home page...");
      // window.location.href = "/";
      getWalletAddress();
    }
  }, [handled]);

  const getWalletAddress = async () => {
    let keypair;
    try {
      // console.log("Client:", client);
      console.log("Enoki Flow:", enokiFlow);
      console.log("Getting Key Pair...");
      keypair = await enokiFlow.getKeypair({
        network: "testnet",
      });
    } catch (error) {
      console.error("Getting Key Pair Failed:", error);
      const session = sessionStorage.getItem(
        `@enoki/flow/session/${import.meta.env.VITE_ENOKI_API}`
      );
      if (!session) window.location.href = "/";
    }

    if (!keypair) return;
    console.log("Getting Sui Address...");
    const address = keypair.toSuiAddress();

    userContext.setUser({ walletAddress: address });
  };

  useEffect(() => {
    if (userContext.user.walletAddress === "" || !handled) return;
    console.log(userContext.user.walletAddress);

    console.log("User is signed in, redirecting to home page...");
    // window.location.href = "/";
    navigate("/");
  }, [handled, userContext.user]);

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
