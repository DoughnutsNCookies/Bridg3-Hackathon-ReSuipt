import {
  LuScanLine,
  LuHome,
  LuUser2,
  LuSettings,
  LuCopy,
} from "react-icons/lu";
import { Scanner } from "@yudiel/react-qr-scanner";
import { useEffect, useState } from "react";
import { useEnokiFlow } from "@mysten/enoki/react";
import { useSuiClient } from "@mysten/dapp-kit";
import { packageId } from "../deployed-objects.json";
import { Transaction } from "@mysten/sui/transactions";
import usePastReceipts from "../hooks/usePastReceipts";
import PastReceiptCard from "../components/PastReceiptCard";
import SpinnerSvg from "../assets/SpinnerSvg";
import {
  Button,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Tooltip,
  useDisclosure,
} from "@nextui-org/react";

interface ReceiptData {
  name: string;
  price: number;
}

function Home() {
  const [isScanOpen, setIsScanOpen] = useState(false);
  const [isMintOpen, setIsMintOpen] = useState(false);
  const [copiedTooltip, setCopiedTooltip] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [receiptItems, setReceiptItems] = useState<ReceiptData[]>([
    // { name: "42KL", price: 42 },
    // { name: "Apple", price: 33 },
    // { name: "Yes", price: 22 },
  ]);
  const client = useSuiClient();
  const enokiFlow = useEnokiFlow();
  const {
    pastReceipts,
    getPastReceipts,
    isLoading: isGetPastReceiptsLoading,
  } = usePastReceipts(client);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

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
    const keypair = await enokiFlow.getKeypair({
      network: "testnet",
    });

    const address = keypair.toSuiAddress();
    // const address =
    //   "0x744f9472a847e597375f4213375f2911babbfb3ded6910041c17ac9c7fe24398";

    setWalletAddress(address);
    getPastReceipts(address);
  };

  useEffect(() => {
    getWalletAddress();
  }, []);

  const mint = async () => {
    console.log(enokiFlow);

    const keypair = await enokiFlow.getKeypair({
      network: "testnet",
    });

    setWalletAddress(keypair.toSuiAddress());

    const createReceiptTxb = new Transaction();

    console.log("(createReceiptTxb) moveCalling...");
    createReceiptTxb.moveCall({
      target: `${packageId}::resuipt_contracts::createReceipt`,
      arguments: [createReceiptTxb.object(keypair.toSuiAddress())],
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

    console.log("(dynamicFieldTxb) signAndExecuteTransaction...");
    await client.signAndExecuteTransaction({
      signer: keypair,
      transaction: dynamicFieldTxb,
      options: {
        showEffects: true,
      },
    });

    setIsMintOpen(false);
    setReceiptItems([]);
    console.log("Done minting");
  };

  useEffect(() => {
    if (receiptItems.length === 0) setIsMintOpen(false);
    else setIsMintOpen(true);
  }, [receiptItems]);

  return (
    <div className="relative">
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="center">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                ReSuipt QR Scanner
              </ModalHeader>
              <ModalBody className="z-10">
                <Scanner
                  onScan={(data) => {
                    console.log(data[0].rawValue);
                    const obj = JSON.parse(data[0].rawValue);
                    console.log(obj);
                    setIsScanOpen(false);
                    setReceiptItems(obj);
                  }}
                  paused={!isOpen}
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <div className="h-screen w-screen bg-sea justify-center flex">
        <div className="w-full max-w-[425px]">
          <div className="h-[8vh] sticky top-0 flex flex-col justify-center shadow-md bg-cloud rounded-bl-xl rounded-br-xl">
            <div className="flex justify-between px-5 items-center">
              <img src="logoText.png" className="h-9" />
              <Tooltip
                content="Copied!"
                isOpen={copiedTooltip}
                color="primary"
                showArrow
                size="lg"
              >
                <div className="px-4 py-1 rounded-lg bg-ocean">
                  <Link
                    className="text-cloud font-bold gap-2"
                    showAnchorIcon={walletAddress ? true : false}
                    anchorIcon={<LuCopy />}
                    onPress={() => {
                      if (walletAddress) {
                        navigator.clipboard.writeText(walletAddress);
                        setCopiedTooltip(true);
                        setTimeout(() => {
                          setCopiedTooltip(false);
                        }, 500);
                      } else {
                        handleSignIn();
                      }
                    }}
                  >
                    {`${
                      walletAddress
                        ? `${walletAddress.slice(
                            0,
                            6
                          )}....${walletAddress.slice(-4)}`
                        : "Login"
                    }`}
                  </Link>
                </div>
              </Tooltip>
            </div>
          </div>
          <div className="h-[84vh] bg-sea overflow-y-scroll pb-4">
            {isGetPastReceiptsLoading ? (
              <div className="h-full flex flex-col gap-4 justify-center items-center flex-wrap">
                <span className="text-2xl font-bold italic">
                  Receipts are loading...
                </span>
                <SpinnerSvg />
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
          <div
            className="h-[8vh] sticky bottom-0 z-10 bg-cloud rounded-tl-xl rounded-tr-xl"
            style={{
              boxShadow:
                "0 -4px 6px -1px rgba(0, 0, 0, 0.1), 0 -2px 4px -1px rgba(0, 0, 0, 0.06)",
            }}
          >
            <div className="flex justify-between px-2 items-center pt-2">
              <div
                onClick={() => {
                  setIsScanOpen(false);
                }}
                className="w-1/4 flex flex-col items-center"
              >
                <div className="flex justify-center items-center">
                  <LuHome className="text-4xl" />
                </div>
                <span>Home</span>
              </div>
              <button
                className="w-1/4 flex flex-col items-center"
                onClick={() => onOpen()}
              >
                <div className="flex justify-center items-center">
                  <LuScanLine className="text-4xl" />
                </div>
                <span>Scan</span>
              </button>
              <button
                className="w-1/4 flex flex-col items-center"
                onClick={handleSignIn}
              >
                <div className="flex justify-center items-center">
                  <LuUser2 className="text-4xl" />
                </div>
                <span>Login</span>
              </button>
              <div className="w-1/4 flex flex-col items-center">
                <div className="flex justify-center items-center">
                  <LuSettings className="text-4xl" />
                </div>
                <span>Settings</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] px-10 w-full max-w-[425px]">
        <div
          className={`bg-cloud w-full rounded-xl transition-all duration-300 ease-in-out ${
            isMintOpen ? "" : "hidden"
          }`}
        >
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
