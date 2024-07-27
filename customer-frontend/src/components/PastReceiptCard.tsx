import { LuCopy } from "react-icons/lu";
import { PastReceipt } from "../hooks/usePastReceipts";

interface PastReceiptProps {
  pastReceipt: PastReceipt;
  index: number;
  length: number;
}

const PastReceiptCard = (props: PastReceiptProps) => {
  const { pastReceipt, index, length } = props;

  let total = 0;
  pastReceipt.data.forEach((v) => (total += v.price));

  const copyTxId = (tx: string) => {
    navigator.clipboard.writeText(tx);
  };

  return (
    <div className="pt-2 px-2">
      <div className="border-1 bg-cloud rounded-xl">
        <div className="text-center pt-4 pb-2 relaive">
          <div className="absolute left-6">
            <span className="opacity-30 text-xs">#{length - index}</span>
          </div>
          <span className="text-3xl font-semibold">SPH Store</span>
        </div>
        <ul className="pt-4 px-4 flex flex-col gap-2">
          {pastReceipt.data.map((v, i) => (
            <li className="flex flex-row justify-between" key={i}>
              <span>{v.name}</span>
              <div className="flex flex-row gap-2">
                <span>$ {v.price}</span>
              </div>
            </li>
          ))}
          <div className="border border-ocean" />
          <div className="flex flex-row justify-between font-bold">
            <span>Total</span>
            <div className="flex flex-row gap-2">
              <span>$ {total}</span>
            </div>
          </div>
        </ul>
        <div className="px-4 pb-4 flex justify-between">
          <div className="text-start flex-1 flex items-center gap-1">
            <span className="text-xs opacity-30">
              Tx: {pastReceipt.txDigest.slice(0, 6)}....
              {pastReceipt.txDigest.slice(-4)}
            </span>
            <span
              className="text-xs opacity-30"
              onClick={() => copyTxId(pastReceipt.txDigest)}
            >
              <LuCopy />
            </span>
          </div>
          <div className="text-end">
            <span className="text-xs opacity-30">{pastReceipt.timestamp}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PastReceiptCard;
