import { useEnokiFlow } from "@mysten/enoki/react";
import { useEffect, useState } from "react";

function Test() {
  const enokiFlow = useEnokiFlow();
  const [walletAddress, setWalletAddress] = useState<string>("");

  const getAddress = async () => {
    const session = await enokiFlow.getSession();
    console.log(session);
    console.log(session?.jwt);
    const keypair = await enokiFlow.getKeypair();

    const address = keypair.toSuiAddress();
    setWalletAddress(address);
  };

  useEffect(() => {
    getAddress();
  });
  return (
    <div className="flex flex-col h-screen justify-center items-center">
      Wallet Address: {walletAddress}
      <a href="/">Home</a>
    </div>
  );
}

export default Test;
