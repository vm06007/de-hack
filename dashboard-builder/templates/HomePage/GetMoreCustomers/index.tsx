import Card from "@/components/Card";
import Button from "@/components/Button";

const socials = [
    {
        icon: "twitter",
        href: "https://x.com/dehack",
    },
    {
        icon: "facebook",
        href: "https://www.facebook.com/de-hack",
    },
    {
        icon: "instagram",
        href: "https://www.instagram.com/dehack/",
    },
    {
        icon: "threads",
        href: "https://www.threads.net/@dehack",
    },
];

const GetMoreHackers = ({}) => {
    return (
        <Card className="hidden" title="Get more hackers">
            <div className="hidden mb-6 px-5 text-body-2 text-t-secondary max-lg:px-3">
                Fifty percent of new hackers explore hackathons because the
                author shares their work on social media. <br></br>Start earning
                now! 🔥
            </div>
            <div className="flex gap-3">
                {socials.map((social, index) => (
                    <Button
                        className="flex-1 !px-0"
                        icon={social.icon}
                        key={index}
                        isStroke
                        as="a"
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                    />
                ))}
            </div>
        </Card>
    );
};

export default GetMoreHackers;
