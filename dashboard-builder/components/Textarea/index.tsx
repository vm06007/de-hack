import { forwardRef } from "react";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    className?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, error, className = "", ...props }, ref) => {
        return (
            <div className={`field ${className}`}>
                {label && (
                    <div className="field-label">
                        {label}
                        {props.required && <span className="text-red-500 ml-1">*</span>}
                    </div>
                )}
                <textarea
                    ref={ref}
                    className={`field-input ${error ? "field-error" : ""}`}
                    {...props}
                />
                {error && <div className="field-error-text">{error}</div>}
            </div>
        );
    }
);

Textarea.displayName = "Textarea";

export default Textarea;
