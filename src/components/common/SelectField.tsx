'use client';

interface SelectOption<T extends string> {
    label: string;
    value: T;
}

interface SelectFieldProps<T extends string> {
    id: string;
    label: string;
    value: T;
    onChange: (value: T) => void;
    options: SelectOption<T>[];
    required?: boolean;
    disabled?: boolean;
    error?: string;
}

export default function SelectField<T extends string>({
    id,
    label,
    value,
    onChange,
    options,
    required = false,
    disabled = false,
    error,
}: SelectFieldProps<T>) {
    return (
        <div className="flex flex-col gap-1 w-full">
            <label
                htmlFor={id}
                className="text-[var(--fs-sm)] font-medium text-[var(--text-primary)]"
            >
                {label}
                {required && <span className="text-[var(--danger)] ml-1">*</span>}
            </label>
            <select
                id={id}
                name={id}
                value={value}
                onChange={(e) => onChange(e.target.value as T)}
                disabled={disabled}
                required={required}
                className="
                    w-full px-3 py-2 border rounded-[var(--r-md)] text-[var(--fs-sm)]
                    bg-[var(--background)] text-[var(--text-primary)]
                    border-[var(--input-border)]
                    transition-colors duration-200
                    focus:outline-none focus:ring-2 focus:ring-[var(--input-border-focus)] focus:border-[var(--input-border-focus)]
                    disabled:bg-[var(--input-disabled)] disabled:cursor-not-allowed
                "
                style={{
                    borderColor: error ? 'var(--danger)' : undefined,
                }}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && (
                <span className="text-[var(--fs-xs)] text-[var(--danger)]">{error}</span>
            )}
        </div>
    );
}