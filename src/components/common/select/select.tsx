'use client';

import * as PopoverPrimitive from "@radix-ui/react-popover";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, Search } from "lucide-react";
import {
    forwardRef,
    useId,
    useMemo,
    useRef,
    useState,
    Fragment,
    type CSSProperties,
    type ChangeEvent,
    type KeyboardEvent,
    type ReactElement,
    type ReactNode,
} from "react";
import { twMerge } from "tailwind-merge";

export interface SelectOption {
    value: string;
    label: ReactNode;
    disabled?: boolean;
}

type SelectTriggerProps = React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>;

export interface SelectProps extends Omit<SelectTriggerProps, "children" | "value" | "onChange" | "disabled" | "id"> {
    label: string;
    name: string;
    error?: string;
    required?: boolean;
    labelClassName?: string;
    options?: SelectOption[];
    multiple?: boolean;
    searchable?: boolean;
    /** @deprecated Compatibilidade visual; novos usos seguem data-theme. */
    variant?: "white" | "gray";
    placeholder?: string;
    maxWidth?: CSSProperties["maxWidth"];
    maxHeight?: CSSProperties["maxHeight"];
    id?: string;
    value?: string | string[] | readonly string[];
    defaultValue?: string | string[] | readonly string[];
    disabled?: boolean;
    onChange?: (event: ChangeEvent<HTMLSelectElement>) => void;
    onValueChange?: (value: string | string[]) => void;
    children?: ReactNode;
}

interface ParsedOption extends SelectOption {
    textValue: string;
}

function textContent(value: ReactNode): string {
    if (typeof value === "string" || typeof value === "number") return String(value);
    if (Array.isArray(value)) return value.map(textContent).join("");
    if (value && typeof value === "object" && "props" in value) {
        return textContent((value as ReactElement<{ children?: ReactNode }>).props.children);
    }
    return "";
}

function optionsFromChildren(children: ReactNode): SelectOption[] {
    const result: SelectOption[] = [];

    const visit = (nodes: ReactNode) => {
        if (Array.isArray(nodes)) {
            nodes.forEach(visit);
            return;
        }

        if (!nodes || typeof nodes !== "object" || !("type" in nodes)) return;

        const element = nodes as ReactElement<{ value?: string; disabled?: boolean; children?: ReactNode }>;
        if (element.type === "option") {
            result.push({
                value: element.props.value ?? "",
                label: element.props.children,
                disabled: element.props.disabled,
            });
            return;
        }

        if (element.type === Fragment) visit(element.props.children);
    };

    visit(children);
    return result;
}

function normalizeValues(value: string | string[] | readonly string[] | undefined, multiple: boolean): string[] {
    if (typeof value === "string") return value ? [value] : [];
    if (!value) return [];
    const values = [...value];
    return multiple ? values : values.slice(0, 1);
}

function changeEvent(name: string, value: string | string[], multiple: boolean): ChangeEvent<HTMLSelectElement> {
    const target = {
        name,
        type: multiple ? "select-multiple" : "select-one",
        value,
    } as unknown as HTMLSelectElement;

    return {
        target,
        currentTarget: target,
        type: "change",
        bubbles: true,
        cancelable: false,
        defaultPrevented: false,
        eventPhase: 3,
        isTrusted: false,
        nativeEvent: new Event("change"),
        preventDefault: () => undefined,
        isDefaultPrevented: () => false,
        stopPropagation: () => undefined,
        isPropagationStopped: () => false,
        persist: () => undefined,
        timeStamp: Date.now(),
    } as unknown as ChangeEvent<HTMLSelectElement>;
}

function optionIsSelected(option: SelectOption, values: string[]) {
    return values.includes(option.value);
}

const baseTriggerClassName = `
    flex min-h-10 w-full min-w-0 items-center gap-2 rounded-lg border-2 border-transparent
    px-3 py-2.5 text-left text-sm font-normal transition-colors duration-300 cursor-pointer
    border-input-border bg-input-bg text-input-text
    outline-none focus:border-input-border-focus focus:outline-2 focus:outline-input-border-focus
    disabled:cursor-not-allowed disabled:bg-input-bg-disabled disabled:text-input-text-disabled
`;

const optionClassName = `
    relative flex w-full cursor-pointer select-none items-center gap-2 rounded-md px-3 py-2.5
    text-left text-sm text-primary outline-none data-[highlighted]:bg-background-secondary
    focus-visible:bg-background-secondary focus-visible:outline-2 focus-visible:outline-input-border-focus
    data-[state=checked]:font-bold data-[disabled]:pointer-events-none data-[disabled]:opacity-50
`;

export const Select = forwardRef<HTMLButtonElement, SelectProps>(function Select({
    label,
    error,
    name,
    value,
    defaultValue,
    className,
    required,
    children,
    labelClassName,
    options,
    multiple = false,
    searchable = false,
    variant,
    placeholder,
    maxWidth,
    maxHeight = "18rem",
    id: idProp,
    disabled,
    onChange,
    onValueChange,
    ...triggerProps
}, ref) {
    const generatedId = useId();
    const id = idProp ?? generatedId;
    const listboxId = `${id}-listbox`;
    const errorId = `${id}-error`;
    const hasError = Boolean(error);
    const parsedOptions = useMemo<ParsedOption[]>(() => {
        const source = options ?? optionsFromChildren(children);
        return source.map((option) => ({ ...option, textValue: textContent(option.label) }));
    }, [children, options]);
    const placeholderOption = parsedOptions.find((option) => option.value === "");
    const availableOptions = parsedOptions.filter((option) => option.value !== "");
    const placeholderText = placeholder ?? (textContent(placeholderOption?.label) || "Selecione uma opção");
    const controlled = value !== undefined;
    const [internalValue, setInternalValue] = useState(() => normalizeValues(defaultValue, multiple));
    const selectedValues = normalizeValues(controlled ? value : internalValue, multiple);
    const selectedOptions = availableOptions.filter((option) => selectedValues.includes(option.value));
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const searchRef = useRef<HTMLInputElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const optionRefs = useRef<Array<HTMLDivElement | null>>([]);
    const isCustom = multiple || searchable;
    const filteredOptions = useMemo(() => {
        const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
        if (!normalizedQuery) return availableOptions;
        return availableOptions.filter((option) => option.textValue.toLocaleLowerCase("pt-BR").includes(normalizedQuery));
    }, [availableOptions, query]);

    // Ref callbacks track the rendered options. Clearing them in an effect loses
    // the live nodes after opening/filtering and breaks keyboard navigation.
    function focusOption(start: number, direction: 1 | -1 = 1) {
        for (let index = start; index >= 0 && index < filteredOptions.length; index += direction) {
            if (!filteredOptions[index].disabled) {
                optionRefs.current[index]?.focus();
                return;
            }
        }
    }

    const setValue = (nextValues: string[]) => {
        if (!controlled) setInternalValue(nextValues);
        const nextValue = multiple ? nextValues : (nextValues[0] ?? "");
        onValueChange?.(nextValue);
        onChange?.(changeEvent(name, nextValue, multiple));
    };

    const selectOption = (option: SelectOption) => {
        if (option.disabled) return;
        const nextValues = multiple
            ? optionIsSelected(option, selectedValues)
                ? selectedValues.filter((valueToRemove) => valueToRemove !== option.value)
                : [...selectedValues, option.value]
            : [option.value];
        setValue(nextValues);
        if (!multiple) {
            setOpen(false);
            triggerRef.current?.focus();
        }
    };

    const describedBy = [hasError ? errorId : undefined, triggerProps["aria-describedby"]]
        .filter(Boolean)
        .join(" ") || undefined;
    const variantTriggerClassName = variant === "gray"
        ? "border-transparent bg-input-legacy-bg text-input-legacy-text"
        : "";
    const triggerClassName = twMerge(
        baseTriggerClassName,
        variantTriggerClassName,
        hasError
            ? "border-input-border-error focus:border-input-border-error focus:outline-input-border-error"
            : "",
        className,
    );
    const selectedText = selectedOptions.map((option) => option.textValue).join(", ");
    const displayText = multiple
        ? selectedText || placeholderText
        : selectedOptions[0]?.textValue || placeholderText;

    const triggerContent = (
        <>
            <span className="min-w-0 flex-1 truncate">
                {displayText}
            </span>
            <ChevronDown aria-hidden="true" className="shrink-0 text-j-gray-400" size={20} />
        </>
    );

    const commonTriggerProps = {
        ...triggerProps,
        ref: (node: HTMLButtonElement | null) => {
            triggerRef.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) ref.current = node;
        },
        id,
        disabled,
        className: triggerClassName,
        "aria-invalid": hasError || undefined,
        "aria-describedby": describedBy,
        "aria-required": required || undefined,
    };
    return (
        <div className="flex w-full min-w-0 flex-col gap-2" style={{ maxWidth }}>
            <label htmlFor={id} className={twMerge("text-xs font-bold text-primary md:text-sm", labelClassName)}>
                {label} {required ? <span aria-hidden="true" className="text-input-error-text">*</span> : null}
            </label>

            {isCustom ? (
                <PopoverPrimitive.Root
                    open={open}
                    onOpenChange={(nextOpen) => {
                        setOpen(nextOpen);
                        if (!nextOpen) setQuery("");
                    }}
                >
                    <PopoverPrimitive.Trigger asChild>
                        <button
                            {...commonTriggerProps}
                            className={triggerClassName}
                            type="button"
                            role="combobox"
                            aria-expanded={open}
                            aria-controls={listboxId}
                            aria-haspopup="listbox"
                            aria-label={multiple && selectedText ? `${label}: ${selectedText}` : undefined}
                        >
                            {triggerContent}
                        </button>
                    </PopoverPrimitive.Trigger>
                    {/* A native modal makes body portals inert; keep options in the trigger's top layer. */}
                    <PopoverPrimitive.Portal container={triggerRef.current?.closest('dialog') ?? undefined}>
                        <PopoverPrimitive.Content
                            align="start"
                            sideOffset={4}
                            onOpenAutoFocus={(event) => {
                                event.preventDefault();
                                if (searchable) searchRef.current?.focus();
                                else focusOption(0);
                            }}
                            className="z-50 w-[var(--radix-popover-trigger-width)] min-w-48 max-w-[calc(100vw-1rem)] rounded-lg border border-j-gray-200 bg-j-white p-1.5 shadow-xl outline-none"
                            style={{ maxWidth, maxHeight }}
                        >
                            {searchable ? (
                                <div className="relative mb-1.5">
                                    <Search aria-hidden="true" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-j-gray-400" size={16} />
                                    <input
                                        ref={searchRef}
                                        type="search"
                                        value={query}
                                        onChange={(event) => setQuery(event.target.value)}
                                        onKeyDown={(event) => {
                                            if (event.key === "ArrowDown") {
                                                event.preventDefault();
                                                focusOption(0);
                                            }
                                            if (event.key === "Escape") {
                                                event.preventDefault();
                                                setOpen(false);
                                            }
                                        }}
                                        placeholder={`Pesquisar ${label}`}
                                        aria-label={`Pesquisar ${label}`}
                                        className="h-9 w-full rounded-md border border-input-border bg-input-bg pl-8 pr-2 text-sm text-input-text outline-none placeholder:text-input-placeholder focus:outline-2 focus:outline-input-border-focus"
                                    />
                                </div>
                            ) : null}

                            <div
                                id={listboxId}
                                role="listbox"
                                aria-label={label}
                                aria-multiselectable={multiple || undefined}
                                className="max-h-[inherit] overflow-y-auto overscroll-contain"
                            >
                                {filteredOptions.length ? filteredOptions.map((option, index) => {
                                    const selected = optionIsSelected(option, selectedValues);
                                    return (
                                        <div
                                            key={option.value}
                                            ref={(node) => { optionRefs.current[index] = node; }}
                                            role="option"
                                            aria-selected={selected}
                                            aria-disabled={option.disabled || undefined}
                                            data-disabled={option.disabled ? "" : undefined}
                                            tabIndex={option.disabled ? -1 : 0}
                                            className={twMerge(optionClassName, selected && "font-bold text-j-blue-800", option.disabled && "cursor-not-allowed")}
                                            onClick={() => selectOption(option)}
                                            onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
                                                if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                                                    event.preventDefault();
                                                    const direction = event.key === "ArrowDown" ? 1 : -1;
                                                    focusOption(index + direction, direction);
                                                }
                                                if (event.key === "Home" || event.key === "End") {
                                                    event.preventDefault();
                                                    focusOption(event.key === "Home" ? 0 : filteredOptions.length - 1, event.key === "Home" ? 1 : -1);
                                                }
                                                if (event.key === "Enter" || event.key === " ") {
                                                    event.preventDefault();
                                                    selectOption(option);
                                                }
                                                if (event.key === "Escape") {
                                                    event.preventDefault();
                                                    setOpen(false);
                                                    triggerRef.current?.focus();
                                                }
                                            }}
                                        >
                                            <span aria-hidden="true" className={twMerge(
                                                "flex h-4 w-4 shrink-0 items-center justify-center text-j-blue-700",
                                            )}>
                                                {selected ? <Check aria-hidden="true" size={16} strokeWidth={3} /> : null}
                                            </span>
                                            <span className="min-w-0 flex-1 truncate">{option.label}</span>
                                        </div>
                                    );
                                }) : (
                                    <p role="status" className="px-3 py-3 text-sm text-j-gray-500">
                                        {query.trim() ? "Nenhuma opção encontrada." : "Nenhuma opção disponível."}
                                    </p>
                                )}
                            </div>
                        </PopoverPrimitive.Content>
                    </PopoverPrimitive.Portal>
                </PopoverPrimitive.Root>
            ) : (
                <SelectPrimitive.Root
                    name={name}
                    open={open}
                    onOpenChange={setOpen}
                    value={selectedValues[0] || undefined}
                    onValueChange={(nextValue) => setValue([nextValue])}
                    disabled={disabled}
                    required={required}
                >
                    <SelectPrimitive.Trigger
                        {...commonTriggerProps}
                        className={triggerClassName}
                        aria-label={undefined}
                        // Radix hides the outside tree while the menu owns focus.
                        // Keep its hidden trigger out of the tab order until close.
                        tabIndex={open ? -1 : triggerProps.tabIndex}
                    >
                        <span className="min-w-0 flex-1 truncate text-left">
                            <SelectPrimitive.Value placeholder={placeholderText} />
                        </span>
                        <SelectPrimitive.Icon asChild>
                            <ChevronDown aria-hidden="true" className="shrink-0 text-j-gray-400" size={20} />
                        </SelectPrimitive.Icon>
                    </SelectPrimitive.Trigger>
                    <SelectPrimitive.Portal container={triggerRef.current?.closest('dialog') ?? undefined}>
                        <SelectPrimitive.Content
                            position="popper"
                            sideOffset={4}
                            className="z-50 min-w-[var(--radix-select-trigger-width)] max-w-[calc(100vw-1rem)] overflow-hidden rounded-lg border border-j-gray-200 bg-j-white p-1.5 shadow-xl"
                            style={{ maxWidth }}
                        >
                            <SelectPrimitive.Viewport className="overflow-y-auto" style={{ maxHeight }}>
                                {availableOptions.length ? availableOptions.map((option) => {
                                    const selected = selectedValues[0] === option.value;
                                    return (
                                        <SelectPrimitive.Item
                                            key={option.value}
                                            value={option.value}
                                            disabled={option.disabled}
                                            textValue={option.textValue}
                                            className={optionClassName}
                                        >
                                            <span aria-hidden="true" className="flex h-4 w-4 shrink-0 items-center justify-center text-j-blue-700">
                                                {selected ? <Check aria-hidden="true" size={16} strokeWidth={3} /> : null}
                                            </span>
                                            <SelectPrimitive.ItemText className="min-w-0 flex-1 truncate">{option.label}</SelectPrimitive.ItemText>
                                        </SelectPrimitive.Item>
                                    );
                                }) : (
                                    <p className="px-3 py-3 text-sm text-j-gray-500">Nenhuma opção disponível.</p>
                                )}
                            </SelectPrimitive.Viewport>
                        </SelectPrimitive.Content>
                    </SelectPrimitive.Portal>
                </SelectPrimitive.Root>
            )}

            {isCustom ? (
                <input
                    type="hidden"
                    name={name}
                    value={multiple ? selectedValues.join(",") : selectedValues[0] ?? ""}
                    required={required}
                    readOnly
                />
            ) : null}
            {hasError ? <p id={errorId} className="text-sm text-input-error-text">{error}</p> : null}
        </div>
    );
});

Select.displayName = "Select";
