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
            <label htmlFor={id} className="text-sm font-medium text-gray-700">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
                id={id}
                name={id}
                value={value}
                onChange={(e) => onChange(e.target.value as T)}
                disabled={disabled}
                required={required}
                className={`
                    w-full px-3 py-2 border rounded-md text-sm
                    bg-white text-gray-900
                    transition-colors duration-200
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    disabled:bg-gray-100 disabled:cursor-not-allowed
                    ${error ? 'border-red-500' : 'border-gray-300'}
                `}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && (
                <span className="text-xs text-red-500">{error}</span>
            )}
        </div>
    );
}