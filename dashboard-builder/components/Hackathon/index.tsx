import Link from "next/link";
import { NumericFormat } from "react-number-format";
import Image from "@/components/Image";

type HackathonProps = {
    value: {
        id: number;
        title: string;
        image: string;
        prize: number;
        status: string;
    };
};

const Hackathon = ({ value }: HackathonProps) => (
    <Link
        className="group relative flex items-center p-3 cursor-pointer"
        href={`/hackathons/${value.id}`}
    >
        <div className="box-hover"></div>
        <div className="relative z-2 shrink-0">
            <Image
                className="size-16 rounded-xl opacity-100"
                src={value.image}
                fallbackType="banner"
                width={64}
                height={64}
                alt=""
            />
        </div>
        <div className="relative z-2 grow max-w-56.5 px-5 line-clamp-2 text-sub-title-1 max-2xl:px-3 max-lg:pl-5">
            {value.title}
        </div>
        <div className="relative z-2 flex flex-col items-end shrink-0 ml-auto text-right">
            <NumericFormat
                className="mb-1 text-sub-title-1"
                value={value.prize}
                thousandSeparator=","
                decimalScale={0}
                fixedDecimalScale
                displayType="text"
                prefix="$"
            />
            <div
                className={`inline-flex items-center h-6 px-1.5 rounded-lg border text-caption leading-none capitalize ${
                    value.status === "active" ? "label-green" : 
                    value.status === "upcoming" ? "label-blue" : "label-red"
                }`}
            >
                {value.status}
            </div>
        </div>
    </Link>
);

export default Hackathon;
