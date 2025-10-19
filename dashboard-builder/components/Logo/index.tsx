import Link from "next/link";

type LogoProps = {
    className?: string;
};

const Logo = ({ className }: LogoProps) => {
    return (
        <Link className={`flex items-center gap-3 ${className || ""}`} href="/">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none" style={{transform: 'rotate(90deg)'}}>
                <path fill="currentColor" fillRule="evenodd" d="M18.385.563a5.333 5.333 0 0 0-4.77 0L2.948 5.896A5.333 5.333 0 0 0 0 10.666v10.667a5.333 5.333 0 0 0 2.948 4.77l10.667 5.334c1.501.75 3.269.75 4.77 0l10.667-5.333A5.333 5.333 0 0 0 32 21.334V10.666a5.333 5.333 0 0 0-2.948-4.77L18.385.562Zm-7.718 10.104a5.333 5.333 0 1 1 10.666 0v10.666a5.333 5.333 0 1 1-10.666 0V10.667Z" clipRule="evenodd"></path>
                <path fill="currentColor" d="M18.667 10.667a2.667 2.667 0 1 1-5.334 0 2.667 2.667 0 0 1 5.334 0Z"></path>
                <path fill="currentColor" d="M18.667 20.667a2.667 2.667 0 1 1-5.334 0 2.667 2.667 0 0 1 5.334 0Z"></path>
            </svg>
            <span className="text-xl font-bold text-white">DeHack</span>
        </Link>
    );
};

export default Logo;
