import {
  LuScanLine,
  LuHome,
  LuUser2,
  LuSettings,
  LuCopy,
} from "react-icons/lu";
import ReceiptSvg from "../assets/ReceiptSvg";
import { Scanner } from "@yudiel/react-qr-scanner";
import { useEffect, useState } from "react";
import { useEnokiFlow } from "@mysten/enoki/react";
import { useSuiClient } from "@mysten/dapp-kit";
import { packageId } from "../deployed-objects.json";
import { Transaction } from "@mysten/sui/transactions";
import usePastReceipts from "../hooks/usePastReceipts";
import PastReceiptCard from "../components/PastReceiptCard";
import SpinnerSvg from "../assets/SpinnerSvg";

interface ReceiptData {
  name: string;
  price: number;
}

function Home() {
  const [isScanOpen, setIsScanOpen] = useState(false);
  const [isMintOpen, setIsMintOpen] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [receiptTxb, setReceiptTxb] = useState<any>(null);
  const [receiptItems, setReceiptItems] = useState<ReceiptData[]>([
    // { name: "42KL", price: 42 },
    // { name: "Apple", price: 3 },
    // { name: "Yes", price: 10 },
  ]);
  const client = useSuiClient();
  const enokiFlow = useEnokiFlow();
  const {
    pastReceipts,
    getPastReceipts,
    isLoading: isGetPastReceiptsLoading,
  } = usePastReceipts(client);

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

  const getWalletAddress = async () => {
    // const keypair = await enokiFlow.getKeypair({
    //   network: "testnet",
    // });

    // const address = keypair.toSuiAddress();
    const address =
      "0x744f9472a847e597375f4213375f2911babbfb3ded6910041c17ac9c7fe24398";

    setWalletAddress(address);

    getPastReceipts(address);

    // Copy the wallet address to the clipboard
    // navigator.clipboard.writeText(keypair.toSuiAddress());
  };

  useEffect(() => {}, [walletAddress]);

  const mint = async () => {
    console.log(enokiFlow);

    const keypair = await enokiFlow.getKeypair({
      network: "testnet",
    });

    setWalletAddress(keypair.toSuiAddress());

    const createReceiptTxb = new Transaction();
    const total: number = receiptItems.reduce((acc, v) => acc + v.price, 0);

    console.log("(createReceiptTxb) moveCalling...");
    createReceiptTxb.moveCall({
      target: `${packageId}::resuipt_contracts::createReceipt`,
      arguments: [
        createReceiptTxb.object(keypair.toSuiAddress()),
        createReceiptTxb.pure.u64(total),
      ],
    });

    createReceiptTxb.setGasBudget(100_000_000);

    console.log("(createReceiptTxb) signAndExecuteTransaction...");
    const createReceiptRes = await client.signAndExecuteTransaction({
      signer: keypair,
      transaction: createReceiptTxb,
      options: {
        showEffects: true,
      },
    });

    setReceiptTxb(createReceiptRes.digest);

    const resEffects: any = createReceiptRes.effects;
    const receiptId = resEffects.created[0].reference.objectId;

    console.log(`https://suiscan.xyz/testnet/object/${receiptId}`);

    const dynamicFieldTxb = new Transaction();

    console.log("(dynamicFieldTxb) moveCalling...");
    for (let item of receiptItems) {
      const itemName = item.name;
      const itemPrice = item.price;

      console.log(`(dynamicFieldTxb) adding ${itemName} of price ${itemPrice}`);
      dynamicFieldTxb.moveCall({
        target: `${packageId}::resuipt_contracts::addItemToReceipt`,
        arguments: [
          dynamicFieldTxb.object(receiptId),
          dynamicFieldTxb.pure.string(itemName),
          dynamicFieldTxb.pure.u64(itemPrice),
        ],
      });
    }

    dynamicFieldTxb.setGasBudget(10_000_000);

    await client.signAndExecuteTransaction({
      signer: keypair,
      transaction: dynamicFieldTxb,
      options: {
        showEffects: true,
      },
    });
  };

  useEffect(() => {
    if (receiptItems.length === 0) setIsMintOpen(false);
    else setIsMintOpen(true);
  }, [receiptItems]);

  return (
    <div className="relative">
      <div className="h-screen w-screen bg-sea">
        <div className="h-[8vh] sticky top-0 flex flex-col justify-center bg-cloud rounded-bl-xl rounded-br-xl">
          <div className="flex justify-between px-5 items-center">
            <img src="logoText.png" className="h-9" />
            <div
              onClick={getWalletAddress}
              className="px-4 py-1 rounded-lg bg-ocean"
            >
              <span className="text-cloud font-bold">
                {`${
                  walletAddress
                    ? `${walletAddress.slice(0, 6)}....${walletAddress.slice(
                        -4
                      )}`
                    : "Customer"
                }`}
              </span>
            </div>
          </div>
        </div>
        <div className="h-[84vh] bg-sea">
          {/* <div className="h-full flex justify-center items-center flex-wrap">
            <div>
              <div className="flex justify-center">
                <ReceiptSvg />
              </div>
              <div>
                <span className="opacity-30">You dont have any receipts</span>
              </div>
            </div>
          </div> */}
          {isGetPastReceiptsLoading ? (
            <div className="h-full flex justify-center items-center flex-wrap">
              <div>
                <div className="flex justify-center">
                  <SpinnerSvg />
                </div>
              </div>
            </div>
          ) : (
            pastReceipts.length > 0 &&
            pastReceipts.map((v, i) => (
              <PastReceiptCard
                pastReceipt={v}
                index={i}
                length={pastReceipts.length}
                key={i}
              />
            ))
          )}
        </div>
        <div className="h-[8vh] bg-cloud rounded-tl-xl rounded-tr-xl">
          <div className="flex justify-between px-5 items-center pt-2">
            <div>
              <div className="flex justify-center items-center">
                <LuHome className="text-4xl" />
              </div>
              <span>Home</span>
            </div>
            <button onClick={() => setIsScanOpen(true)}>
              <div className="flex justify-center items-center">
                <LuScanLine className="text-4xl" />
              </div>
              <span>Scan</span>
            </button>
            <button onClick={handleSignIn}>
              <div className="flex justify-center items-center">
                <LuUser2 className="text-4xl" />
              </div>
              <span>Login</span>
            </button>
            <div>
              <div className="flex justify-center items-center">
                <LuSettings className="text-4xl" />
              </div>
              <span>Settings</span>
            </div>
          </div>
        </div>
      </div>
      <div className="h-[100vh] absolute top-0 bg-cloud" hidden={!isScanOpen}>
        <div className="flex h-full justify-center items-center">
          <Scanner
            onScan={(data) => {
              console.log(data[0].rawValue);
              const obj = JSON.parse(data[0].rawValue);
              console.log(obj);
              setIsScanOpen(false);
              setReceiptItems(obj);
            }}
            components={{ finder: false }}
            paused={!isScanOpen}
          />
        </div>
      </div>
      <div className="absolute top-[50%] -translate-y-[50%] px-10 w-full">
        <div className="bg-cloud w-full rounded-xl" hidden={!isMintOpen}>
          <div className="p-3">
            <div className="text-center">
              <span className="font-semibold text-3xl">SPH Store</span>
            </div>
            <div className="py-4">
              {receiptItems.map((v, i) => {
                return (
                  <div className="flex justify-between" key={i}>
                    <div>
                      <span>{v.name}</span>
                    </div>
                    <div>
                      <span>$ {v.price}</span>
                    </div>
                  </div>
                );
              })}
              <div className="flex justify-between">
                <div>
                  <span className="font-semibold">Total</span>
                </div>
                <div>
                  <span className="font-semibold">
                    $ {receiptItems.reduce((acc, v) => acc + v.price, 0)}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <button className="rounded-md w-full bg-aqua py-2" onClick={mint}>
                Mint
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
