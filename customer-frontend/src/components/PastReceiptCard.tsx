import { PastReceipt } from "../hooks/usePastReceipts";
import {
  Card,
  CardHeader,
  Divider,
  CardBody,
  CardFooter,
  Link,
} from "@nextui-org/react";

interface PastReceiptProps {
  pastReceipt: PastReceipt;
  index: number;
}

const PastReceiptCard = (props: PastReceiptProps) => {
  const { pastReceipt, index } = props;

  return (
    <Card className="mt-4 mx-4" key={index}>
      <CardHeader className="text-center flex flex-col w-full">
        <p className="text-3xl font-semibold">SPH Store</p>
      </CardHeader>
      <Divider />
      <CardBody>
        <ul className="p-4 flex flex-col gap-2">
          <div className="flex flex-row justify-between font-bold">
            <span>Item Name</span>
            <span>Price</span>
          </div>
          <div className="border border-ocean" />
          {pastReceipt.data.map((item, index) => (
            <li key={index} className="flex flex-row justify-between">
              <span>{item.name}</span>
              <span>{item.price}</span>
            </li>
          ))}
          {pastReceipt.data.length === 0 && (
            <li className="flex flex-row h-[30px] text-ocean/70 items-center justify-center">
              <span>No items...</span>
            </li>
          )}
          <div className="border border-ocean" />
          <div className="flex flex-row justify-between font-bold text-lg">
            <span>Total</span>
            <span>
              $ {pastReceipt.data.reduce((acc, item) => acc + item.price, 0)}
            </span>
          </div>
        </ul>
      </CardBody>
      <Divider />
      <CardFooter className="px-4 pb-4 flex justify-between">
        <div className="text-start flex-1 flex items-center gap-1">
          <Link
            color="primary"
            size="sm"
            isExternal
            href={`https://suiscan.xyz/testnet/object/${pastReceipt.txDigest}`}
            showAnchorIcon
          >
            Tx: {pastReceipt.txDigest.slice(0, 6)}....
            {pastReceipt.txDigest.slice(-4)}
          </Link>
        </div>
        <span className="text-sm">{pastReceipt.timestamp}</span>
      </CardFooter>
    </Card>
  );
};

export default PastReceiptCard;
