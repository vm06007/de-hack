import Icon from "@/components/Icon";
import Link from "next/link";
import Button from "@/components/Button";
import Image from "@/components/Image";

const highlights = [
    "Global Online Hackathon",
    "30-day development period",
    "$500K+ total prize pool",
    "Expert judges panel",
    "Networking opportunities",
];

const Description = ({}) => (
    <div className="flex text-[1.125rem] font-medium leading-[1.75rem] max-lg:block">
        <div className="grow pr-16 max-xl:pr-10 max-lg:pr-0">
            <div className="mb-8 text-h4 max-md:mb-6 max-md:text-h5">
                Overview
            </div>
            <div className="[&_p,&_ul]:mb-7 [&_ul]:list-disc [&_ul]:pl-5 [&_a]:underline [&_a]:hover:no-underline [&_p:last-child,&_ul:last-child]:mb-0">
                <p>
                    Join the most prestigious{" "}
                    <a href="#">
                        <strong>blockchain hackathon</strong>
                    </a>
                    in the ecosystem. ETHGlobal Online 2026 brings together the
                    brightest minds in{" "}
                    <strong>Web3 development</strong> for an intensive
                    30-day building experience. This global event connects
                    developers, designers, and entrepreneurs from around the
                    world to build the future of decentralized technology.
                </p>
                <p>
                    Participants will have access to cutting-edge tools, expert
                    mentorship, and a supportive community. From DeFi protocols
                    to NFT marketplaces, gaming platforms to infrastructure
                    solutions - this hackathon welcomes all innovative projects
                    that push the boundaries of what&apos;s possible on Ethereum 🚀
                </p>
                <p className="!mb-0">
                    <strong>🚀 Perfect for:</strong>
                </p>
                <ul>
                    <li>DeFi Protocol Development</li>
                    <li>NFT & Gaming Projects</li>
                    <li>Infrastructure & Tooling</li>
                    <li>Privacy & Security Solutions</li>
                    <li>Social & DAO Applications</li>
                    <li>Cross-chain Integration</li>
                </ul>
                <p>
                    Whether you&apos;re a seasoned blockchain developer or just
                    starting your Web3 journey, ETHGlobal Online 2026 provides
                    the perfect platform to showcase your skills, learn from
                    industry experts, and potentially launch your next big
                    project. The hackathon features workshops, networking events,
                    and direct access to leading protocols and VCs. 😎
                </p>
            </div>
        </div>
        <div className="shrink-0 w-91 max-lg:flex max-lg:gap-15 max-lg:w-full max-lg:mt-16 max-md:flex-col max-md:gap-8 max-md:mt-8">
            <div className="max-lg:flex-1">
                <div className="mb-8 text-h4 max-lg:mb-3 max-lg:text-h5">
                    Highlights
                </div>
                <ul>
                    {highlights.map((highlight) => (
                        <li
                            className="flex items-center py-5 border-t border-s-stroke2 first:border-t-0"
                            key={highlight}
                        >
                            <Icon
                                className="mr-3 fill-t-primary"
                                name="check-circle-fill"
                            />{" "}
                            {highlight}
                        </li>
                    ))}
                </ul>
                <div className="flex flex-col gap-3 shrink-0 mt-2">
                    <Link href="/applications/hacker">
                        <Button className="w-full" isBlack>
                            Hacker Application
                        </Button>
                    </Link>
                    <Link href="/applications/sponsor">
                        <Button className="w-full" isStroke>
                            Sponsor Application
                        </Button>
                    </Link>
                </div>
            </div>
            <div className="mt-15 max-lg:flex-1 max-lg:mt-0">
                <div className="flex items-center">
                    <div className="shrink-0">
                        <Image
                            className="size-17 object-cover opacity-100 rounded-full"
                            src="/images/avatar.png"
                            width={68}
                            height={68}
                            alt="shop-banner"
                        />
                    </div>
                    <div className="grow pl-6">
                        <div className="text-h4 max-lg:text-h5">ETHGlobal</div>
                        <div className="text-t-secondary">Kartik Talwar (0x123...321)</div>
                    </div>
                </div>
                <div className="flex mt-8 border-t border-s-stroke2">
                    <div className="flex-1 pt-8 pr-8 border-r border-s-stroke2 max-md:pt-6">
                        <div className="flex items-center gap-2">
                            <div className="text-h4">4.96</div>
                            <Icon
                                className="!size-4 fill-t-primary"
                                name="star-fill"
                            />
                        </div>
                        <div>Ratings</div>
                    </div>
                    <div className="flex-1 pt-8 pl-8 max-md:pt-6">
                        <div className="text-h4">8+</div>
                        <div>Years hosting</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export default Description;
