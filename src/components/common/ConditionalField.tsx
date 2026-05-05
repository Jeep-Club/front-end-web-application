'use client';

interface ConditionalFieldProps {
    id: string;
    toggleLabel: string;
    textareaLabel: string;
    toggleValue: boolean;
    textareaValue: string;
    onToggleChange: (value: boolean) => void;
    onTextareaChange: (value: string) => void;
    placeholder?: string;
    required?: boolean;
    error?: string;
}

export default function ConditionalField({
    id,
    toggleLabel,
    textareaLabel,
    toggleValue,
    textareaValue,
    onToggleChange,
    onTextareaChange,
    placeholder,
    required = false,
    error,
}: ConditionalFieldProps) {
    return (
        <div className="flex flex-col gap-2 w-full">
            {/* Toggle */}
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    role="switch"
                    aria-checked={toggleValue}
                    onClick={() => onToggleChange(!toggleValue)}
                    className={`
                        relative inline-flex h-6 w-11 items-center rounded-full
                        transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500
                        ${toggleValue ? 'bg-blue-600' : 'bg-gray-300'}
                    `}
                >
                    <span
                        className={`
                            inline-block h-4 w-4 transform rounded-full bg-white shadow
                            transition-transform duration-200
                            ${toggleValue ? 'translate-x-6' : 'translate-x-1'}
                        `}
                    />
                </button>
                <span className="text-sm font-medium text-gray-700">{toggleLabel}</span>
            </div>

            {/* Campo de descrição */}
            {toggleValue && (
                <div className="flex flex-col gap-1 w-full">
                    <label htmlFor={id} className="text-sm font-medium text-gray-700">
                        {textareaLabel}
                        {required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <textarea
                        id={id}
                        name={id}
                        value={textareaValue}
                        onChange={(e) => onTextareaChange(e.target.value)}
                        placeholder={placeholder}
                        rows={3}
                        required={required && toggleValue}
                        className={`
                            w-full px-3 py-2 border rounded-md text-sm resize-none
                            bg-white text-gray-900 placeholder-gray-400
                            transition-colors duration-200
                            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                            ${error ? 'border-red-500' : 'border-gray-300'}
                        `}
                    />
                    {error && (
                        <span className="text-xs text-red-500">{error}</span>
                    )}
                </div>
            )}
        </div>
    );
}