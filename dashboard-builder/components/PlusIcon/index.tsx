import React from 'react';

type PlusIconProps = {
    className?: string;
    onClick?: () => void;
};

const PlusIcon = ({ className = "", onClick }: PlusIconProps) => {
    return (
        <button
            onClick={onClick}
            className={`w-8 h-8 rounded-full bg-b-surface2 hover:bg-b-surface3 flex items-center justify-center transition-colors ${className}`}
            type="button"
        >
            <svg
                className="w-4 h-4 text-t-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                />
            </svg>
        </button>
    );
};

export default PlusIcon;
