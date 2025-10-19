import Icon from "@/components/Icon";

const socials = [
    {
        icon: "github",
        href: "https://github.com/alexchen_dev",
    },
    {
        icon: "twitter",
        href: "https://twitter.com/alexchen_dev",
    },
    {
        icon: "linkedin",
        href: "https://linkedin.com/in/alexchen",
    },
];

const Contacts = ({}) => (
    <div>
        <div className="flex flex-wrap justify-between gap-4 max-md:gap-3">
            <div className="flex items-center gap-3 text-body-2">
                <Icon className="fill-t-secondary" name="envelope-think" />
                alex@hackathon.dev
            </div>
            <div className="flex items-center gap-3 text-body-2 max-lg:order-3">
                <Icon className="fill-t-secondary" name="earth" />
                San Francisco, CA
            </div>
            <div className="flex gap-2">
                {socials.map((social, index) => (
                    <a
                        className="group flex items-center justify-center w-9 h-9"
                        key={index}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Icon
                            className="fill-t-secondary transition-colors group-hover:fill-t-primary"
                            name={social.icon}
                        />
                    </a>
                ))}
            </div>
        </div>
    </div>
);

export default Contacts;
