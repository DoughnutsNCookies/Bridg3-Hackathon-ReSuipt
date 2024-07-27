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
  Image,
} from "@nextui-org/react";

interface ReceiptData {
  name: string;
  price: number;
}

interface ModalFields {
  header: React.ReactNode;
  body: React.ReactNode;
  mint?: boolean;
}

/**
 * Minting Loading
 *
 */
function Home() {
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
  const [modalFields, setModalFields] = useState<ModalFields>({
    header: <></>,
    body: <></>,
  });
  const [mintLoading, setMintLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [appLoading, setAppLoading] = useState(false);

  const handleSignIn = () => {
    setLoginLoading(true);

    const protocol = window.location.protocol;
    const host = window.location.host;
    // Set the redirect URL to the location that should
    // handle authorization callbacks in your app
    const redirectUrl = `${protocol}//${host}/google`;

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
        setLoginLoading(false);
        window.location.href = url;
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const getWalletAddress = async () => {
    setAppLoading(true);

    let keypair;
    try {
      keypair = await enokiFlow.getKeypair({
        network: "testnet",
      });
    } catch (error) {
      setAppLoading(false);
    }

    if (!keypair) return;
    const address = keypair.toSuiAddress();
    // const address =
    //   "0x744f9472a847e597375f4213375f2911babbfb3ded6910041c17ac9c7fe24398";

    setWalletAddress(address);
    getPastReceipts(address);
    setAppLoading(false);
  };

  useEffect(() => {
    getWalletAddress();
  }, []);

  const mint = async (onClose: any) => {
    console.log("Minting...");
    setMintLoading(true);

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

    dynamicFieldTxb.setGasBudget(100_000_000);

    console.log("(dynamicFieldTxb) signAndExecuteTransaction...");
    await client.signAndExecuteTransaction({
      signer: keypair,
      transaction: dynamicFieldTxb,
      options: {
        showEffects: true,
      },
    });

    setReceiptItems([]);
    setMintLoading(false);
    console.log("Done minting");

    onClose();
    getPastReceipts(walletAddress);
  };

  useEffect(() => {
    if (receiptItems.length === 0) return;

    setModalFields({
      header: <p>SPH Store</p>,
      body: (
        <ul className="flex flex-col gap-2">
          <div className="flex flex-row justify-between font-bold">
            <span>Item Name</span>
            <span>Price</span>
          </div>
          <div className="border border-ocean" />
          {receiptItems.map((item, index) => (
            <li key={index} className="flex flex-row justify-between">
              <span>{item.name}</span>
              <span>{item.price}</span>
            </li>
          ))}
          {receiptItems.length === 0 && (
            <li className="flex flex-row h-[30px] text-ocean/70 items-center justify-center">
              <span>No items...</span>
            </li>
          )}
          <div className="border border-ocean" />
          <div className="flex flex-row justify-between font-bold text-lg">
            <span>Total</span>
            <span>
              $ {receiptItems.reduce((acc, item) => acc + item.price, 0)}
            </span>
          </div>
        </ul>
      ),
      mint: true,
    });
    onOpen();
  }, [receiptItems]);

  return (
    <div className="h-screen w-screen bg-sea justify-center flex">
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="center">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>{modalFields.header}</ModalHeader>
              <ModalBody>{modalFields.body}</ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  onPress={onClose}
                  className={`${modalFields.mint ? "hidden" : ""}`}
                >
                  Close
                </Button>
                <Button
                  color="danger"
                  variant="light"
                  onPress={onClose}
                  className={`${modalFields.mint ? "" : "hidden"}`}
                >
                  Close
                </Button>
                <Button
                  color="success"
                  onPress={() => {
                    mint(onClose);
                  }}
                  className={`text-cloud font-bold ${
                    modalFields.mint ? "" : "hidden"
                  }`}
                  isLoading={mintLoading}
                >
                  Mint
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <div className="w-full max-w-[425px]">
        <div className="h-[8vh] sticky top-0 flex flex-col z-10 justify-center shadow-md bg-cloud rounded-bl-xl rounded-br-xl">
          <div className="flex justify-between px-5 items-center">
            <img src="logoText.png" className="h-9" />
            <Tooltip
              content="Copied!"
              isOpen={copiedTooltip}
              color="primary"
              showArrow
              size="lg"
            >
              <Button
                className="px-4 py-1 rounded-lg bg-ocean"
                isLoading={loginLoading}
              >
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
                      ? `${walletAddress.slice(0, 6)}....${walletAddress.slice(
                          -4
                        )}`
                      : "Login"
                  }`}
                </Link>
              </Button>
            </Tooltip>
          </div>
        </div>
        <div className="h-[84vh] bg-sea overflow-y-scroll pb-4">
          {!appLoading ? (
            <></>
          ) : (
            <div className="h-full flex flex-col gap-4 justify-center items-center flex-wrap">
              <Image src="/logo.png" width={80} />
              <div className="flex flex-col gap-2 text-center">
                <span className="text-2xl font-bold italic text-cloud">
                  Loggin In...
                </span>
              </div>
            </div>
          )}
          {walletAddress !== "" ? (
            <></>
          ) : (
            <div className="h-full flex flex-col gap-4 justify-center items-center flex-wrap">
              <Image src="/logo.png" width={80} />
              <div className="flex flex-col gap-2 text-center">
                <span className="text-2xl font-bold italic text-cloud">
                  Nothing to show...
                </span>
                <span className="text-xl font-bold">
                  Login to view your receipts!
                </span>
              </div>
            </div>
          )}
          {isGetPastReceiptsLoading ? (
            <div className="h-full flex flex-col gap-4 justify-center items-center flex-wrap">
              <Image src="/logo.png" width={80} />
              <span className="text-2xl font-bold italic text-cloud">
                Receipts are loading...
              </span>
              <SpinnerSvg />
            </div>
          ) : (
            pastReceipts.length > 0 &&
            pastReceipts
              .sort((a, b) => {
                const aTimestamp = a.timestamp;
                const bTimestamp = b.timestamp;
                return bTimestamp.localeCompare(aTimestamp);
              })
              .map((v, i) => (
                <PastReceiptCard pastReceipt={v} index={i} key={i} />
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
            <div className="w-1/4 flex flex-col items-center">
              <div className="flex justify-center items-center">
                <LuHome className="text-4xl" />
              </div>
              <span>Home</span>
            </div>
            <button
              className="w-1/4 flex flex-col items-center"
              onClick={() => {
                setModalFields({
                  header: (
                    <div className="flex flex-col">
                      <span>ReSuipt QR Scanner</span>
                      <span className="text-sm">
                        Scan your merchant&apos;s QR to retrieve the ReSuipt!
                      </span>
                    </div>
                  ),
                  body: (
                    <Scanner
                      onScan={(data) => {
                        console.log(data[0].rawValue);
                        const obj = JSON.parse(data[0].rawValue);
                        console.log(obj);
                        setReceiptItems(obj);
                      }}
                    />
                  ),
                });
                onOpen();
              }}
            >
              <div className="flex justify-center items-center">
                <LuScanLine className="text-4xl" />
              </div>
              <span>Scan</span>
            </button>
            <button className="w-1/4 flex flex-col items-center">
              <div className="flex justify-center items-center">
                <LuUser2 className="text-4xl" />
              </div>
              <span>Profile</span>
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
  );
}

export default Home;
