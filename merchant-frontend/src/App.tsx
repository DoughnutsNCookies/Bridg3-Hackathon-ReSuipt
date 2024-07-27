import QRCode from "react-qr-code";
import {
  LuHome,
  LuUser2,
  LuSettings,
  LuHistory,
  LuXCircle,
} from "react-icons/lu";
import { useState } from "react";

interface Item {
  name: string;
  price: number;
}

function App() {
  const [items, setItems] = useState<Item[]>([
    { name: "Milk", price: 24.0 },
    { name: "Cereal", price: 230.0 },
    { name: "Milo", price: 12.0 },
  ]);

  const addItem = () => {
    const name = (
      document.querySelector('input[type="text"]') as HTMLInputElement
    ).value;
    const price = parseFloat(
      (document.querySelector('input[type="number"]') as HTMLInputElement).value
    );

    if (!name || !price) return;

    setItems([...items, { name, price }]);

    (document.querySelector('input[type="text"]') as HTMLInputElement).value =
      "";
    (document.querySelector('input[type="number"]') as HTMLInputElement).value =
      "";
  };

  return (
    <div className="h-screen w-screen bg-sea flex justify-center ">
      <div className="max-w-[425px]">
        <div className="h-[8vh] sticky top-0 flex flex-col justify-center bg-cloud rounded-bl-xl rounded-br-xl">
          <div className="flex justify-between px-5 items-center">
            <img src="logo2.webp" className="h-9" />
            <div className="px-4 py-1 rounded-lg bg-ocean">
              <span className="font-medium text-cloud">Merchant</span>
            </div>
          </div>
        </div>
        <div className="min-h-[84vh] p-4 bg-sea text-center">
          <h1 className="pt-8 text-3xl font-bold">SPH Store</h1>
          <div className="pt-8">
            <div className="border-1 bg-cloud rounded-xl">
              <div className="flex justify-center pb-2 pt-5">
                <QRCode value={JSON.stringify(items)} className="h-[180px]" />
              </div>
              <ul className="p-4 flex flex-col gap-2">
                {items.map((item) => (
                  <li className="flex flex-row justify-between">
                    <span>{item.name}</span>
                    <div className="flex flex-row gap-2">
                      <span>${item.price}</span>
                      <button
                        className="text-ocean rounded"
                        onClick={() => {
                          setItems(items.filter((i) => i !== item));
                        }}
                      >
                        <LuXCircle size={25} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="pt-4">
            <div className="flex justify-between gap-2">
              <input
                type="text"
                placeholder="Item"
                className="w-1/2 p-2 border rounded"
              />
              <input
                type="number"
                placeholder="Price"
                className="w-1/2 p-2 border rounded"
              />
              <button
                className="px-4 py-2 bg-ocean text-cloud rounded"
                onClick={addItem}
              >
                Add
              </button>
            </div>
          </div>
        </div>
        <div className="h-[8vh] sticky bottom-0 bg-cloud rounded-tl-xl rounded-tr-xl">
          <div className="flex justify-between px-5 items-center pt-2">
            <div>
              <div className="flex justify-center items-center">
                <LuHome className="text-4xl" />
              </div>
              <span>Home</span>
            </div>
            <div>
              <div className="flex justify-center items-center">
                <LuHistory className="text-4xl" />
              </div>
              <span>History</span>
            </div>
            <div>
              <div className="flex justify-center items-center">
                <LuUser2 className="text-4xl" />
              </div>
              <span>Profile</span>
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
    </div>
  );
}

export default App;
