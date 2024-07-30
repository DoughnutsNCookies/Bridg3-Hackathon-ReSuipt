import { LuScanLine, LuHome, LuUser2, LuCopy, LuLogOut } from "react-icons/lu";
import { Scanner } from "@yudiel/react-qr-scanner";
import { useEffect, useRef, useState } from "react";
import { useEnokiFlow } from "@mysten/enoki/react";
import { useSuiClient } from "@mysten/dapp-kit";
// import { packageId } from "../deployed-objects.json";
// import { Transaction } from "@mysten/sui/transactions";
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
import axios from "axios";
import { fromB64 } from "@mysten/sui/utils";
import { useUser } from "../hooks/useUser";

interface ItemData {
  name: string;
  price: number;
}

interface ReceiptData {
  items: ItemData[];
  merchantAddress: string;
}

interface ModalFields {
  header: React.ReactNode;
  body: React.ReactNode;
  mint?: boolean;
}

function Home() {
  const [copiedTooltip, setCopiedTooltip] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [receiptData, setReceiptData] = useState<ReceiptData>({
    items: [
      { name: "42KL", price: 42 },
      { name: "Milk", price: 3 },
      { name: "No", price: 5 },
    ],
    merchantAddress:
      "0x989db4b897b1f72d32c64c34ee16a3fb8532c4335a67e094ac2a0182abe33fc6",
  });
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
  const mintStatusRef = useRef<any>();

  const userContext = useUser();

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
        console.log("Redirecting to:", url);
        window.location.href = url;
      })
      .catch((error) => {
        console.error("Failed to create authorization URL:", error);
        console.error(error);
      });
  };

  useEffect(() => {
    console.log(userContext.user);
    if (userContext.user.walletAddress === "") return;
    const address = userContext.user.walletAddress;
    console.log(address);
    setWalletAddress(address);
    getPastReceipts(address);
  }, [userContext.user.walletAddress]);

  // const mintV1 = async (onClose: any) => {
  //   console.log("Minting...");
  //   setMintLoading(true);

  //   const keypair = await enokiFlow.getKeypair({
  //     network: "testnet",
  //   });

  //   const createReceiptTxb = new Transaction();
  //   console.log("(createReceiptTxb) moveCalling...");
  //   createReceiptTxb.moveCall({
  //     target: `${packageId}::resuipt_contracts::createReceipt`,
  //     arguments: [createReceiptTxb.object(keypair.toSuiAddress())],
  //   });

  //   createReceiptTxb.setGasBudget(100_000_000);

  //   console.log("(createReceiptTxb) signAndExecuteTransaction...");
  //   const createReceiptRes = await client.signAndExecuteTransaction({
  //     signer: keypair,
  //     transaction: createReceiptTxb,
  //     options: {
  //       showEffects: true,
  //     },
  //   });

  //   const resEffects: any = createReceiptRes.effects;
  //   const receiptId = resEffects.created[0].reference.objectId;

  //   console.log(`https://suiscan.xyz/testnet/object/${receiptId}`);

  //   const dynamicFieldTxb = new Transaction();

  //   console.log("(dynamicFieldTxb) moveCalling...");
  //   for (let item of receiptItems) {
  //     const itemName = item.name;
  //     const itemPrice = item.price;

  //     console.log(`(dynamicFieldTxb) adding ${itemName} of price ${itemPrice}`);
  //     dynamicFieldTxb.moveCall({
  //       target: `${packageId}::resuipt_contracts::addItemToReceipt`,
  //       arguments: [
  //         dynamicFieldTxb.object(receiptId),
  //         dynamicFieldTxb.pure.string(itemName),
  //         dynamicFieldTxb.pure.u64(itemPrice),
  //       ],
  //     });
  //   }

  //   dynamicFieldTxb.setGasBudget(100_000_000);

  //   console.log("(dynamicFieldTxb) signAndExecuteTransaction...");
  //   await client.signAndExecuteTransaction({
  //     signer: keypair,
  //     transaction: dynamicFieldTxb,
  //     options: {
  //       showEffects: true,
  //     },
  //   });

  //   setReceiptItems([]);
  //   setMintLoading(false);
  //   console.log("Done minting");

  //   onClose();
  //   getPastReceipts(walletAddress);
  // };

  // const mintV2 = async (onClose: any) => {
  //   console.log("Minting...");
  //   setMintLoading(true);

  //   if (!mintStatusRef.current) return;
  //   const mintCurrent: any = mintStatusRef.current;

  //   const keypair = await enokiFlow.getKeypair({
  //     network: "testnet",
  //   });

  //   const backendUrl = import.meta.env.VITE_BACKEND_URL;
  //   if (!backendUrl) return;

  //   // Create Receipt...
  //   mintCurrent.innerText = "(1/6) Creating receipt...";
  //   const sponsorTxResCreateReceipt = await axios.post(
  //     `${backendUrl}/sponsorTxCreateReceipt`,
  //     {
  //       address: walletAddress,
  //     }
  //   );

  //   if (sponsorTxResCreateReceipt.status !== 200)
  //     return console.error("Failed to call sponsorTxCreateReceipt");

  //   mintCurrent.innerText = "(2/6) Signing receipt transaction...";
  //   const sponsorTxResCreateReceiptDigest =
  //     sponsorTxResCreateReceipt.data.digest;
  //   const sponsorTxResCreateReceiptBytes = sponsorTxResCreateReceipt.data.bytes;
  //   const signatureCreateReceipt = await keypair.signTransaction(
  //     fromB64(sponsorTxResCreateReceiptBytes)
  //   );
  //   if (!signatureCreateReceipt)
  //     return console.error("Failed to sign sponsorTxResBytes");

  //   mintCurrent.innerText = "(3/6) Backend executing receipt transaction...";
  //   const executeSponsorTxResCreateReceipt = await axios.post(
  //     `${backendUrl}/executeTx`,
  //     {
  //       digest: sponsorTxResCreateReceiptDigest,
  //       signature: signatureCreateReceipt.signature,
  //       isLast: false,
  //     }
  //   );
  //   if (executeSponsorTxResCreateReceipt.status !== 200)
  //     return console.error("Failed to call executeSponsorTx");

  //   // Add Item...
  //   const objectId = executeSponsorTxResCreateReceipt.data.objectId;

  //   mintCurrent.innerText = "(4/6) Adding items...";
  //   const sponsorTxResAddItem = await axios.post(
  //     `${backendUrl}/sponsorTxAddItem`,
  //     {
  //       address: walletAddress,
  //       args: receiptItems.map((v) => ({
  //         objectId: objectId,
  //         itemName: v.name,
  //         itemPrice: v.price,
  //       })),
  //     }
  //   );

  //   mintCurrent.innerText = "(5/6) Signing adding items transaction...";
  //   const sponsorTxResAddItemDigest = sponsorTxResAddItem.data.digest;
  //   const sponsorTxResAddItemBytes = sponsorTxResAddItem.data.bytes;
  //   const signatureAddItem = await keypair.signTransaction(
  //     fromB64(sponsorTxResAddItemBytes)
  //   );

  //   const executeSponsorTxResAddItem = await axios.post(
  //     `${backendUrl}/executeTx`,
  //     {
  //       digest: sponsorTxResAddItemDigest,
  //       signature: signatureAddItem.signature,
  //       isLast: true,
  //     }
  //   );

  //   if (executeSponsorTxResAddItem.status !== 200)
  //     return console.error("Failed to call executeSponsorTx");

  //   setReceiptItems([]);
  //   setMintLoading(false);
  //   console.log("Done minting");

  //   mintCurrent.innerText = "(6/6) Done!";
  //   setMintDisabled(true);

  //   setTimeout(() => {
  //     onClose();
  //     setMintDisabled(false);
  //   }, 1000);
  //   getPastReceipts(walletAddress);
  // };

  const mintV3 = async (onClose: any) => {
    console.log("Minting...");
    setMintLoading(true);

    if (!mintStatusRef.current) return;
    const mintCurrent: any = mintStatusRef.current;

    const keypair = await enokiFlow.getKeypair({
      network: "testnet",
    });

    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    if (!backendUrl) return;

    // Create Receipt...
    mintCurrent.innerText = "(1/3) Creating receipt...";
    const { items, merchantAddress } = receiptData;
    console.log({
      customerAddress: walletAddress,
      merchantAddress: merchantAddress,
      itemNames: items.map((v) => v.name),
      itemPrices: items.map((v) => v.price),
      itemCount: items.length,
    });
    const sponsorTxResCreateReceiptWithItems = await axios.post(
      `${backendUrl}/sponsorTxCreateReceiptWithItems`,
      {
        customerAddress: walletAddress,
        merchantAddress: merchantAddress,
        itemNames: items.map((v) => v.name),
        itemPrices: items.map((v) => v.price),
        itemCount: items.length,
      }
    );

    if (sponsorTxResCreateReceiptWithItems.status !== 200)
      return console.error("Failed to call sponsorTxCreateReceiptWithItems");

    mintCurrent.innerText = "(2/3) Signing receipt transaction...";
    const sponsorTxResCreateReceiptWithItemsDigest =
      sponsorTxResCreateReceiptWithItems.data.digest;
    const sponsorTxResCreateReceiptWithItemsBytes =
      sponsorTxResCreateReceiptWithItems.data.bytes;
    const signatureCreateReceiptWithItems = await keypair.signTransaction(
      fromB64(sponsorTxResCreateReceiptWithItemsBytes)
    );
    if (!signatureCreateReceiptWithItems)
      return console.error("Failed to sign sponsorTxResBytes");

    setTimeout(
      () => (mintCurrent.innerText = "(3/3) Executing receipt transaction..."),
      1000
    );
    const executeSponsorTxResCreateReceiptWithItems = await axios.post(
      `${backendUrl}/executeTx`,
      {
        digest: sponsorTxResCreateReceiptWithItemsDigest,
        signature: signatureCreateReceiptWithItems.signature,
        isLast: true,
      }
    );
    if (executeSponsorTxResCreateReceiptWithItems.status !== 200)
      return console.error("Failed to call executeSponsorTx");

    setReceiptData({ items: [], merchantAddress: "" });
    setMintLoading(false);
    console.log("Done minting");

    onClose();
    getPastReceipts(walletAddress);
  };

  useEffect(() => {
    const { items } = receiptData;
    if (items.length === 0) return;

    setModalFields({
      header: <p>SPH Store</p>,
      body: (
        <div className="flex flex-col gap-8">
          <ul className="flex flex-col gap-2">
            <div className="flex flex-row justify-between font-bold">
              <span>Item Name</span>
              <span>Price</span>
            </div>
            <div className="border border-ocean" />
            {items.map((item, index) => (
              <li key={index} className="flex flex-row justify-between">
                <span>{item.name}</span>
                <span>{item.price}</span>
              </li>
            ))}
            {items.length === 0 && (
              <li className="flex flex-row h-[30px] text-ocean/70 items-center justify-center">
                <span>No items...</span>
              </li>
            )}
            <div className="border border-ocean" />
            <div className="flex flex-row justify-between font-bold text-lg">
              <span>Total</span>
              <span>$ {items.reduce((acc, item) => acc + item.price, 0)}</span>
            </div>
          </ul>
          <p ref={mintStatusRef} className="text-center">
            Click the mint button to mint the receipt!
          </p>
        </div>
      ),
      mint: true,
    });
    onOpen();
  }, [receiptData]);

  return (
    <div className="h-screen w-screen bg-aqua justify-center flex">
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="center"
        hideCloseButton={mintLoading}
      >
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
                  isDisabled={mintLoading}
                >
                  Close
                </Button>
                <Button
                  color="success"
                  onPress={() => {
                    mintV3(onClose);
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
            <img src="logoCustomer.png" className="h-9" />
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
        <div className="h-[84vh] bg-aqua overflow-y-scroll pb-4">
          {walletAddress !== "" ? (
            <></>
          ) : (
            <div className="h-full flex flex-col gap-4 justify-center items-center flex-wrap">
              <Image src="/logo.png" width={80} />
              <div className="flex flex-col gap-2 text-center">
                <span className="text-2xl font-bold italic text-deepOcean">
                  Nothing to show...
                </span>
                <span className="text-xl font-bold">
                  Login to view your receipts!
                </span>
              </div>
            </div>
          )}
          {pastReceipts.length > 0 ? (
            <></>
          ) : (
            <div className="h-full flex flex-col gap-4 justify-center items-center flex-wrap">
              <Image src="/logo.png" width={80} />
              <div className="flex flex-col gap-2 text-center">
                <span className="text-2xl font-bold italic text-deepOcean">
                  No receipts found...
                </span>
                <span className="font-bold">
                  Get your first receipt from a ReSuipt merchant!
                </span>
              </div>
            </div>
          )}
          {isGetPastReceiptsLoading ? (
            <div className="h-full flex flex-col gap-4 justify-center items-center flex-wrap">
              <Image src="/logo.png" width={80} />
              <span className="text-2xl font-bold italic text-deepOcean">
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
                        setReceiptData(obj);
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
            <button
              onClick={() => {
                enokiFlow.logout();
                window.location.reload();
              }}
              className="w-1/4 flex flex-col items-center"
            >
              <div className="flex justify-center items-center">
                <LuLogOut className="text-4xl" />
              </div>
              <span>LogOut</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
