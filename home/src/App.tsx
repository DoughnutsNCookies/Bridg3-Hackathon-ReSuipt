import { Button, Image, Link } from "@nextui-org/react";
import { LuExternalLink } from "react-icons/lu";

function App() {
  return (
    <div className="h-screen w-screen bg-aqua flex flex-col text-center items-center justify-center gap-20">
      <div className="flex flex-col gap-4 items-center justify-center gap-4">
        <Image src="/logoText.png" width={300} />
        <p className="text-xl">
          <strong>Digitalizing receipts </strong>
          with <br />
          <strong>seamless user experience</strong>
        </p>
      </div>
      <div className="flex flex-col gap-8">
        <p className="text-3xl font-bold">I am a...</p>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col items-center">
            <Button
              className="font-bold text-xl"
              size="lg"
              fullWidth
              color="primary"
              onClick={() => {
                window.location.href = "https://merchant.resuipt.xyz";
              }}
              endContent={<LuExternalLink />}
            >
              Merchant
            </Button>
            <Link
              href="https://merchant.resuipt.xyz"
              underline="always"
              className="text-ocean"
            >
              https://merchant.resuipt.xyz
            </Link>
          </div>
          <div className="flex flex-col items-center">
            <Button
              className="font-bold text-xl"
              size="lg"
              fullWidth
              color="primary"
              onClick={() => {
                window.location.href = "https://customer.resuipt.xyz";
              }}
              endContent={<LuExternalLink />}
            >
              Customer
            </Button>
            <Link
              href="https://customer.resuipt.xyz"
              underline="always"
              className="text-ocean"
            >
              https://customer.resuipt.xyz
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
