'use client';

interface InputFieldProps {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: 'text' | 'email' | 'tel' | 'date' | 'password' | 'number';
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    error?: string;
}

export default function InputField({
    id,
    label,
    value,
    onChange,
    type = 'text',
    placeholder,
    required = false,
    disabled = false,
    error,
}: InputFieldProps) {
    return (
        <div className="flex flex-col gap-1 w-full">
            <label
                htmlFor={id}
                className="text-[var(--fs-sm)] font-medium text-[var(--text-primary)]"
            >
                {label}
                {required && <span className="text-[var(--danger)] ml-1">*</span>}
            </label>
            <input
                id={id}
                name={id}
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                required={required}
                disabled={disabled}
                className="
                    w-full px-3 py-2 border rounded-[var(--r-md)] text-[var(--fs-sm)]
                    bg-[var(--background)] text-[var(--text-primary)]
                    placeholder:text-[var(--text-secundary)]
                    border-[var(--input-border)]
                    transition-colors duration-200
                    focus:outline-none focus:ring-2 focus:ring-[var(--input-border-focus)] focus:border-[var(--input-border-focus)]
                    disabled:bg-[var(--input-disabled)] disabled:cursor-not-allowed
                "
                style={{
                    borderColor: error ? 'var(--danger)' : undefined,
                }}
            />
            {error && (
                <span className="text-[var(--fs-xs)] text-[var(--danger)]">{error}</span>
            )}
        </div>
    );
}