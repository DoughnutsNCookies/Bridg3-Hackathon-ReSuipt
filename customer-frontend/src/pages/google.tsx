import { useSuiClient } from "@mysten/dapp-kit";
import { useAuthCallback, useEnokiFlow, useZkLogin } from "@mysten/enoki/react";
import { useEffect } from "react";

function Google() {
  const enokiFlow = useEnokiFlow(); // The EnokiFlow instance
  const { handled } = useAuthCallback();

  useEffect(() => {
    if (handled) {
      // Get access token, perform security checks,
      // manage user session, handle errors, and so on.
      window.location.href = "/";
    }
  }, [handled]);

  const handleSignIn = () => {
    const protocol = window.location.protocol;
    const host = window.location.host;
    // Set the redirect URL to the location that should
    // handle authorization callbacks in your app
    const redirectUrl = `${protocol}//${host}/google`;
    console.log(redirectUrl);

    enokiFlow
      .createAuthorizationURL({
        provider: "google",
        network: "testnet",
        clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        redirectUrl,
        extraParams: {
          scope: ["openid", "email", "profile"],
        },
      })
      .then((url) => {
        window.location.href = url;
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <div className="h-screen flex flex-col gap-4 justify-center text-center items-center">
      <button onClick={handleSignIn}>Sign In</button>
    </div>
  );
}

export default Google;
