import { LuScanLine, LuHome, LuUser2, LuSettings } from "react-icons/lu";
import ReceiptSvg from "./assets/ReceiptSvg";
import { Scanner } from "@yudiel/react-qr-scanner";
import { useEffect, useState } from "react";

interface ReceiptData {
  name: string;
  price: number;
}

function App() {
  const [isScanOpen, setIsScanOpen] = useState(false);
  const [isMintOpen, setIsMintOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData[]>([]);

  useEffect(() => {
    if (receiptData.length === 0) setIsMintOpen(false);
    else setIsMintOpen(true);
  }, [receiptData]);

  return (
    <div className="relative">
      <div className="h-screen w-screen bg-sea">
        <div className="h-[10vh] bg-cloud rounded-bl-xl rounded-br-xl">
          <div className="flex justify-between px-5 pt-10 items-center">
            <div className="flex max-h-full gap-2">
              <div className="h-full">
                <img src="logo2.webp" className="h-9" />
              </div>
            </div>
            <div>
              <div className="px-4 py-1 rounded-lg bg-ocean">
                <span className="font-medium text-cloud">Customer</span>
              </div>
            </div>
          </div>
        </div>
        <div className="h-[82vh] bg-sea">
          {/* <div className="p-2">
          <div className="border-1 bg-cloud rounded-xl">
            <div className="flex justify-center">
              <div className="text-[10px]">
                <ReceiptSvg />
              </div>
            </div>
          </div>
        </div> */}

          <div className="h-full flex justify-center items-center flex-wrap">
            <div>
              <div className="flex justify-center">
                <ReceiptSvg />
              </div>
              <div>
                <span className="opacity-30">You dont have any receipts</span>
              </div>
            </div>
          </div>
        </div>
        <div className="h-[8vh] bg-cloud rounded-tl-xl rounded-tr-xl">
          <div className="flex justify-between px-5 items-center pt-2">
            <div>
              <div className="flex justify-center items-center">
                <LuHome className="text-4xl" />
              </div>
              <span>Home</span>
            </div>
            <div onClick={() => setIsScanOpen(true)}>
              <div className="flex justify-center items-center">
                <LuScanLine className="text-4xl" />
              </div>
              <span>Scan</span>
            </div>
            <div>
              <div className="flex justify-center items-center">
                <LuUser2 className="text-4xl" />
              </div>
              <span>Home</span>
            </div>
            <div>
              <div className="flex justify-center items-center">
                <LuSettings className="text-4xl" />
              </div>
              <span>Settings</span>
            </div>
          </div>
        </div>
      </div>
      <ScanModal
        isOpen={isScanOpen}
        setIsOpen={setIsScanOpen}
        setReceiptData={setReceiptData}
      />
      <MintModal
        isOpen={isMintOpen}
        setIsOpen={setIsMintOpen}
        receiptData={receiptData}
        setReceiptData={setReceiptData}
      />
    </div>
  );
}

export default App;

interface ScanModalProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setReceiptData: React.Dispatch<React.SetStateAction<ReceiptData[]>>;
}

const ScanModal = (props: ScanModalProps) => {
  const { isOpen, setIsOpen, setReceiptData } = props;

  // const test = '[{ "milk": 42 }]';

  return (
    <div className="h-[100vh] absolute top-0 bg-cloud" hidden={!isOpen}>
      <div className="flex h-full justify-center items-center">
        <Scanner
          onScan={(data) => {
            console.log(data[0].rawValue);
            const obj = JSON.parse(data[0].rawValue);
            console.log(obj);
            setIsOpen(false);
            setReceiptData(obj);
          }}
          components={{ finder: false }}
          paused={!isOpen}
        />
      </div>
    </div>
  );
};

interface MintModalProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  receiptData: ReceiptData[];
  setReceiptData: React.Dispatch<React.SetStateAction<ReceiptData[]>>;
}

const MintModal = (props: MintModalProps) => {
  const { isOpen, setIsOpen, receiptData, setReceiptData } = props;

  let total: number = 0;
  if (receiptData.length > 0) {
    receiptData.forEach((v) => {
      total += v.price;
    });
  }

  return (
    <div className="absolute top-[50%] -translate-y-[50%] px-10 w-full">
      <div className="bg-cloud w-full rounded-xl" hidden={!isOpen}>
        <div className="p-3">
          <div className="text-center">
            <span className="font-semibold text-3xl">SPH Store</span>
          </div>
          <div className="py-4">
            {receiptData.map((v, i) => {
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
                <span className="font-semibold">$ {total}</span>
              </div>
            </div>
          </div>
          <div>
            <button
              className="rounded-md w-full bg-aqua py-2"
              onClick={() => {
                setIsOpen(false);
                setReceiptData([]);
              }}
            >
              Mint
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
