import QRCode from "react-qr-code";
import {
  LuScanLine,
  LuHome,
  LuTicket,
  LuPieChart,
  LuUser2,
  LuSettings,
  LuSettings2,
  LuHistory,
} from "react-icons/lu";

function App() {
  return (
    <div className="h-screen w-screen bg-sea">
      <div className="h-[10vh] bg-cloud rounded-bl-xl rounded-br-xl">
        <div className="flex justify-between px-5 pt-10 items-center">
          <div className="flex max-h-full gap-2">
            <div className="h-full">
              <img src="Logo_4.webp" className="h-9" />
            </div>
            <div>
              <span className="text-3xl font-medium">ReSuipt</span>
            </div>
          </div>
          <div>
            <div className="px-4 py-1 rounded-lg bg-ocean">
              <span className="font-medium text-cloud">Merchant</span>
            </div>
          </div>
        </div>
      </div>
      <div className="h-[82vh] bg-sea">
        <div className="p-2">
          <div className="border-1 bg-cloud rounded-xl">
            <div className="flex justify-center pb-2 pt-5">
              <QRCode value="Helloworld" className="h-[180px]" />
            </div>
            <div className="p-3">
              <div className="">
                <ul className="p-3">
                  <li className="border-b border-opacity-15 border-ocean py-1">
                    <div className="flex justify-between items-center pb-1">
                      <div className="">
                        <span>Milk</span>
                      </div>
                      <div className="">
                        <span>$ 24.00</span>
                      </div>
                    </div>
                  </li>
                  <li className="border-b border-opacity-15 border-ocean py-1">
                    <div className="flex justify-between items-center pb-1">
                      <div className="">
                        <span>Cereal</span>
                      </div>
                      <div className="">
                        <span>$ 230.00</span>
                      </div>
                    </div>
                  </li>
                  <li className="border-b border-opacity-15 border-ocean py-1">
                    <div className="flex justify-between items-center pb-1">
                      <div className="">
                        <span>Milo</span>
                      </div>
                      <div className="">
                        <span>$ 12.00</span>
                      </div>
                    </div>
                  </li>
                  <li className="border-b border-opacity-15 border-ocean py-1">
                    <div className="flex justify-between items-center pb-1">
                      <div className="">
                        <span className="font-bold">Total</span>
                      </div>
                      <div className="">
                        <span className="font-bold">$ 266.00</span>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
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
  );
}

export default App;
