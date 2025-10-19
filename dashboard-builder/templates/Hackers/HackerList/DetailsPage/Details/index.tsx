import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import Image from "@/components/Image";
import Editor from "@/components/Editor";
import Contacts from "./Contacts";
import ParticipationHistory from "./ParticipationHistory";

type DetailsProps = {
    onBack: () => void;
};

const Details = ({ onBack }: DetailsProps) => {
    const router = useRouter();
    const [content, setContent] = useState("");

    return (
        <div className="flex flex-col gap-8">
            <div className="flex gap-3">
                <Button
                    className="mr-auto max-md:hidden"
                    isStroke
                    onClick={() => router.back()}
                >
                    Back
                </Button>
                <Button
                    className="!hidden rotate-180 mr-auto max-md:!flex"
                    icon="arrow"
                    isStroke
                    isCircle
                    onClick={onBack}
                />
                <Button isStroke>Follow</Button>
                <Button as="link" href="/messages" isBlack>
                    Message
                </Button>
            </div>
            <div className="flex items-center">
                <div className="shrink-0">
                    <Image
                        className="size-20 rounded-full opacity-100 object-cover"
                        src="/images/avatars/2.png"
                        width={80}
                        height={80}
                        alt=""
                    />
                </div>
                <div className="grow pl-6.5 max-lg:pl-5">
                    <div className="text-h4 max-lg:text-h5">Alex Chen</div>
                    <div className="text-[1.125rem] leading-[2rem] font-semibold text-t-secondary/80 max-lg:text-body-2">
                        @alexchen_dev
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                        <div className="text-caption-1 text-n-4">
                            $125,000 total earnings
                        </div>
                        <div className="text-caption-1 text-n-4">
                            23 participations
                        </div>
                        <div className="text-caption-1 text-n-4">
                            34.8% win rate
                        </div>
                    </div>
                </div>
            </div>
            <Editor
                label="Private notes"
                tooltip="Maximum 100 characters. No HTML or emoji allowed"
                content={content}
                onChange={setContent}
            />
            <Contacts />
            <ParticipationHistory />
        </div>
    );
};

export default Details;
