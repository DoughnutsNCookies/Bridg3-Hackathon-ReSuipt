import QRCode from "react-qr-code";
import {
  LuHome,
  LuUser2,
  LuSettings,
  LuHistory,
  LuXCircle,
  LuCopy,
} from "react-icons/lu";
import { useEffect, useRef, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Input,
  Link,
  Tooltip,
} from "@nextui-org/react";

interface Item {
  name: string;
  price: number;
}

function App() {
  const [items, setItems] = useState<Item[]>([{ name: "42KL", price: 42.0 }]);
  const [itemName, setItemName] = useState<any>("");
  const [itemPrice, setItemPrice] = useState<any>("");
  const [walletAddress, setWalletAddress] = useState<any>("");
  const priceRef = useRef<HTMLInputElement>(null);
  const [copiedTooltip, setCopiedTooltip] = useState(false);

  const addItem = () => {
    const name = (
      document.querySelector('input[type="text"]') as HTMLInputElement
    ).value;
    const price = parseFloat(
      (document.querySelector('input[type="number"]') as HTMLInputElement).value
    );

    if (!name || !price) return;

    setItems([...items, { name, price }]);
    setItemName("");
    setItemPrice("");
  };

  useEffect(() => {
    const walletAddress = import.meta.env.VITE_MERCHANT_WALLET;
    if (!walletAddress) return;
    setWalletAddress(walletAddress);
  }, []);

  return (
    <div className="h-screen w-screen bg-aqua flex flex-col justify-center">
      {/* <div className="max-w-[425px]"> */}
      <div className="h-[8vh] sticky top-0 z-10 flex flex-col justify-center shadow-md bg-cloud rounded-bl-xl rounded-br-xl">
        <div className="flex justify-between px-5 z-10 items-center">
          <img src="logoMerchant.png" className="h-9" />
          <Tooltip
            content="Copied!"
            isOpen={copiedTooltip}
            color="primary"
            showArrow
            size="lg"
          >
            <Button className="px-4 py-1 rounded-lg bg-ocean">
              <Link
                className="text-cloud font-bold gap-2"
                showAnchorIcon={walletAddress ? true : false}
                anchorIcon={<LuCopy />}
                onPress={() => {
                  navigator.clipboard.writeText(walletAddress);
                  setCopiedTooltip(true);
                  setTimeout(() => {
                    setCopiedTooltip(false);
                  }, 500);
                }}
              >
                {`${
                  walletAddress
                    ? `${walletAddress.slice(0, 6)}....${walletAddress.slice(
                        -4
                      )}`
                    : "Loading..."
                }`}
              </Link>
            </Button>
          </Tooltip>
        </div>
      </div>
      <div className="min-h-[84vh] flex flex-col items-center justify-center p-4 bg-aqua ">
        <Card className="py-4 max-w-[425px]">
          <CardHeader className="justify-center flex flex-col gap-4 -z-9">
            <h1 className="text-4xl italic font-bold">SPH Store</h1>
            <QRCode
              value={JSON.stringify({
                items: items,
                merchantAddress: walletAddress,
              })}
              className="h-[180px]"
            />
          </CardHeader>
          <CardBody className="py-2">
            <ul className="p-4 flex flex-col gap-2">
              <div className="flex flex-row justify-between font-bold">
                <span>Item Name</span>
                <div className="flex flex-row gap-2">
                  <span>Price</span>
                  <div className="w-[25px]"></div>
                </div>
              </div>
              <div className="border border-ocean" />
              {items.map((item) => (
                <li className="flex flex-row justify-between">
                  <span>{item.name}</span>
                  <div className="flex flex-row gap-2">
                    <span>{item.price}</span>
                    <button
                      className="text-ocean rounded"
                      onClick={() => {
                        setItems(items.filter((i) => i !== item));
                      }}
                    >
                      <LuXCircle size={25} color="red" />
                    </button>
                  </div>
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
                <div className="flex flex-row gap-2">
                  <span>
                    $ {items.reduce((acc, item) => acc + item.price, 0)}
                  </span>
                  <div className="w-[25px]"></div>
                </div>
              </div>
            </ul>
          </CardBody>
          <CardFooter className="flex flex-col justify-between gap-4">
            <div className="flex flex-row justify-between gap-2">
              <Input
                color="primary"
                type="text"
                label="Item Name"
                description="Name of the item"
                placeholder=" "
                value={itemName}
                onValueChange={setItemName}
              />
              <Input
                ref={priceRef}
                color="primary"
                type="number"
                label="Price"
                description="Price of the item"
                value={itemPrice}
                onValueChange={setItemPrice}
                startContent="$"
              />
            </div>
            <Button
              color="primary"
              className="bg-ocean text-cloud"
              size="lg"
              fullWidth
              onClick={addItem}
            >
              Add Item
            </Button>
          </CardFooter>
        </Card>
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
          <div className="w-1/4 flex flex-col items-center">
            <div className="flex justify-center items-center">
              <LuHistory className="text-4xl" />
            </div>
            <span>History</span>
          </div>
          <div className="w-1/4 flex flex-col items-center">
            <div className="flex justify-center items-center">
              <LuUser2 className="text-4xl" />
            </div>
            <span>Profile</span>
          </div>
          <div className="w-1/4 flex flex-col items-center">
            <div className="flex justify-center items-center">
              <LuSettings className="text-4xl" />
            </div>
            <span>Settings</span>
          </div>
        </div>
      </div>
      {/* </div> */}
    </div>
  );
}

export default App;
