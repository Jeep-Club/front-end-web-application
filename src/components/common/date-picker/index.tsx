"use client";

import * as Popover from "@radix-ui/react-popover";
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, Plus, X } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type MouseEvent, type WheelEvent } from "react";
import { maskCivilDate, parseCivilDate } from "@/utils/masks/civilDate";

type DatePickerBase = {
    label: string;
    disabled?: boolean;
    placeholder?: string;
    minDate?: string;
    maxDate?: string;
};

export type DatePickerSingleProps = DatePickerBase & {
    mode: "single";
    value: string | null;
    onChange: (value: string | null) => void | boolean;
};

export type DatePickerRangeValue = { start: string | null; end: string | null };
export type DatePickerRangeProps = DatePickerBase & {
    mode: "range";
    value: DatePickerRangeValue;
    onChange: (value: DatePickerRangeValue) => void | boolean;
};

export type DatePickerProps = DatePickerSingleProps | DatePickerRangeProps;

type DateParts = { date: string; time: string; timed: boolean; seconds: boolean; fraction?: string; original?: string };
type View = "days" | "months" | "years";
const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const SHORT_MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function splitValue(value: string | null | undefined): DateParts {
    const match = /^(\d{4}-\d{2}-\d{2})(?:T(\d{2}:\d{2})(?::(\d{2})(?:\.(\d{1,9}))?)?)?$/.exec(value ?? "");
    return { date: match?.[1] ?? "", time: match ? `${match[2] ?? "00:00"}${match[3] ? `:${match[3]}` : ""}` : "00:00", timed: Boolean(match?.[2]), seconds: Boolean(match?.[3]), fraction: match?.[4], original: value ?? undefined };
}

function toCanonical(parts: DateParts, timeEnabled: boolean): string | null {
    const date = /^\d{4}-/.test(parts.date) ? validIsoDate(parts.date) : parseCivilDate(parts.date);
    if (!date) return null;
    if (!timeEnabled) return parts.original && !parts.timed ? parts.original : date;
    const time = parts.time;
    if (!/^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(time)) return null;
    if (parts.original && parts.timed) return parts.original;
    return `${date}T${time.length === 5 ? `${time}:00` : time}${parts.fraction ? `.${parts.fraction}` : ""}`;
}

function validIsoDate(value: string): string | null {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    const [year, month, day] = value.split("-");
    return parseCivilDate(`${day}/${month}/${year}`);
}

function dateOnly(value: string | null | undefined): string {
    return splitValue(value).date;
}

function dateParts(value: string): [number, number, number] {
    const [year, month, day] = value.split("-").map(Number);
    return [year, month - 1, day];
}

function isoDate(year: number, month: number, day: number): string {
    return `${String(year).padStart(4, "0")}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function prettyDate(value: string): string {
    if (!validIsoDate(value)) return "";
    const parts = dateParts(value);
    return `${String(parts[2]).padStart(2, "0")}/${String(parts[1] + 1).padStart(2, "0")}/${parts[0]}`;
}

function daysInMonth(year: number, month: number) {
    const date = new Date(0);
    date.setUTCHours(0, 0, 0, 0);
    date.setUTCFullYear(year, month + 1, 0);
    return date.getUTCDate();
}
function addDays(value: string, amount: number) {
    const [year, month, day] = dateParts(value);
    const date = new Date(0);
    date.setUTCHours(0, 0, 0, 0);
    date.setUTCFullYear(year, month, day + amount);
    return isoDate(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function withinLimits(value: string, min?: string, max?: string) {
    const day = dateOnly(value);
    return (!min || day >= dateOnly(min)) && (!max || day <= dateOnly(max));
}

function todayIso() {
    const date = new Date();
    return isoDate(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Reusable civil-date picker. Values use YYYY-MM-DD or a local, offset-free
 * YYYY-MM-DDTHH:mm[:ss] value; conversion to API timestamps belongs to callers.
 */
export function DatePicker(props: DatePickerProps) {
    const { label, disabled, placeholder = "dd/mm/aaaa", minDate, maxDate } = props;
    const id = useId();
    const startLabel = props.mode === "range" ? `${label} — data inicial` : label;
    const endLabel = `${label} — data final`;
    const [open, setOpen] = useState(false);
    const [view, setView] = useState<View>("days");
    const [cursorMonth, setCursorMonth] = useState(() => {
        const initial = props.mode === "single" ? props.value : props.value.start;
        const [year, month] = dateParts(dateOnly(initial) || todayIso());
        return { year, month };
    });
    const [focusedYear, setFocusedYear] = useState(cursorMonth.year);
    const [draftSingle, setDraftSingle] = useState<DateParts>(() => splitValue(props.mode === "single" ? props.value : null));
    const [draftRange, setDraftRange] = useState<{ start: DateParts; end: DateParts | null }>(() => ({ start: splitValue(props.mode === "range" ? props.value.start : null), end: props.mode === "range" && props.value.end ? splitValue(props.value.end) : null }));
    const [showEndOverride, setShowEnd] = useState<boolean | undefined>(undefined);
    const showEnd = props.mode === "range" && (showEndOverride ?? Boolean(props.value.end));
    const [pendingEnd, setPendingEnd] = useState(false);
    const lastWheelRef = useRef(0);
    const monthYearClickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [manuallyEdited, setManuallyEdited] = useState(false);
    const [manualStartOverride, setManualStart] = useState<string | undefined>();
    const [manualEndOverride, setManualEnd] = useState<string | undefined>();
    const manualStart = manualStartOverride ?? prettyDate(dateOnly(props.mode === "single" ? props.value : props.value.start));
    const manualEnd = manualEndOverride ?? prettyDate(dateOnly(props.mode === "range" ? props.value.end : null));
    const [error, setError] = useState("");
    const today = todayIso();

    useEffect(() => () => {
        if (monthYearClickTimerRef.current) clearTimeout(monthYearClickTimerRef.current);
    }, []);

    function openPicker(next: boolean) {
        if (next) {
            setError(""); setPendingEnd(false);
            if (!manuallyEdited) {
                if (props.mode === "single") setDraftSingle(splitValue(props.value));
                else setDraftRange({ start: splitValue(props.value.start), end: props.value.end ? splitValue(props.value.end) : showEnd ? splitValue(manualEnd ? parseCivilDate(manualEnd) : null) : null });
            }
            const selected = props.mode === "single" ? props.value : props.value.start;
            const [year, month] = dateParts(dateOnly(selected) || todayIso());
            setCursorMonth({ year, month }); setFocusedYear(year);
        } else {
            setManuallyEdited(false);
            setError("");
            if (props.mode === "single") setManualStart(undefined);
            else {
                setManualStart(undefined);
                setManualEnd(undefined);
                setShowEnd(undefined);
            }
        }
        setOpen(next);
    }

    const visibleDates = useMemo(() => {
        const first = new Date(Date.UTC(cursorMonth.year, cursorMonth.month, 1));
        const mondayOffset = (first.getUTCDay() + 6) % 7;
        const start = addDays(isoDate(cursorMonth.year, cursorMonth.month, 1), -mondayOffset);
        return Array.from({ length: 42 }, (_, index) => addDays(start, index));
    }, [cursorMonth]);

    function changeMonth(delta: number) {
        const next = new Date(Date.UTC(cursorMonth.year, cursorMonth.month + delta, 1));
        setCursorMonth({ year: next.getUTCFullYear(), month: next.getUTCMonth() });
    }

    function navigate(delta: number) {
        if (view === "days") changeMonth(delta);
        else if (view === "months") setFocusedYear(year => year + delta);
        else setFocusedYear(year => year + delta * 12);
    }

    function handleScroll(event: WheelEvent<HTMLDivElement>) {
        const content = event.currentTarget.closest('[data-date-picker-sheet]');
        if (content && content.scrollHeight > content.clientHeight) return;
        if (Math.abs(event.deltaY) < 15) return;
        event.preventDefault();
        if (Date.now() - lastWheelRef.current < 180) return;
        lastWheelRef.current = Date.now();
        navigate(event.deltaY > 0 ? 1 : -1);
    }

    function selectDay(day: string) {
        if (!withinLimits(day, minDate, maxDate)) return;
        if (props.mode === "single") { setDraftSingle(current => ({ ...current, date: day, original: undefined })); setManualStart(prettyDate(day)); setManuallyEdited(true); }
        else if (!pendingEnd) {
            setDraftRange(current => ({ start: { ...current.start, date: day, original: undefined }, end: null }));
            setManualStart(prettyDate(day)); setManualEnd(""); setManuallyEdited(true);
            setShowEnd(true); setPendingEnd(true);
        } else {
            const startDate = draftRange.start.date;
            if (day < startDate) {
                setManualStart(prettyDate(day)); setManualEnd(prettyDate(startDate));
                setDraftRange(current => ({ start: { ...current.start, date: day, original: undefined }, end: { ...(current.end ?? splitValue(null)), date: startDate, original: undefined } }));
            } else {
                setManualEnd(prettyDate(day));
                setDraftRange(current => ({ ...current, end: { ...(current.end ?? splitValue(null)), date: day, original: undefined } }));
            }
            setManuallyEdited(true);
            setPendingEnd(false);
        }
    }

    function apply() {
        setError("");
        if (!manuallyEdited) {
            const values = props.mode === "single" ? [props.value] : [props.value.start, props.value.end];
            if (values.some(value => value && (!toCanonical(splitValue(value), splitValue(value).timed) || !withinLimits(value, minDate, maxDate)))) {
                setError("Confira as datas e os limites permitidos."); return;
            }
            if (props.mode === "range" && props.value.start && props.value.end && props.value.start > props.value.end) {
                setError("A data inicial deve ser anterior ou igual à final."); return;
            }
            if (props.mode === "single") { if (props.onChange(props.value) === false) return; }
            else if (props.onChange({ start: props.value.start, end: props.value.end }) === false) return;
            setOpen(false);
            setManualStart(undefined); setManualEnd(undefined); setShowEnd(undefined);
            return;
        }
        if (props.mode === "single") {
            if (!draftSingle.date) { if (props.onChange(null) === false) return; setOpen(false); setManuallyEdited(false); setManualStart(undefined); return; }
            const value = toCanonical(draftSingle, draftSingle.timed);
            if (!value) { setError("Informe uma data válida."); return; }
            if (!withinLimits(value, minDate, maxDate)) { setError("A data deve respeitar os limites permitidos."); return; }
            if (props.onChange(value) === false) return; setOpen(false); setManuallyEdited(false); setManualStart(undefined); return;
        }
        const start = draftRange.start.date ? toCanonical(draftRange.start, draftRange.start.timed) : null;
        const end = showEnd && draftRange.end?.date ? toCanonical(draftRange.end, draftRange.end.timed) : null;
        if ((draftRange.start.date && !start) || (draftRange.end?.date && !end)) { setError("Confira as datas e horários informados."); return; }
        if (start && end && start > end) { setError("A data inicial deve ser anterior ou igual à final."); return; }
        if ((start && !withinLimits(start, minDate, maxDate)) || (end && !withinLimits(end, minDate, maxDate))) { setError("As datas devem respeitar os limites permitidos."); return; }
        if (props.onChange({ start, end }) === false) return; setOpen(false); setManuallyEdited(false); setManualStart(undefined); setManualEnd(undefined); setShowEnd(undefined);
    }

    function resetDraft() {
        setError(""); setPendingEnd(false);
        setManuallyEdited(true);
        setManualStart(""); setManualEnd("");
        if (props.mode === "single") setDraftSingle(splitValue(null));
        else { setDraftRange({ start: splitValue(null), end: null }); setShowEnd(false); }
    }

    function updateInput(which: "start" | "end", value: string, selectionStart: number | null, inputId: string) {
        const continuingEdit = manuallyEdited;
        const masked = maskCivilDate(value);
        setManuallyEdited(true);
        if (props.mode === "single" || which === "start") setManualStart(masked);
        else setManualEnd(masked);
        const digitsBeforeCaret = value.slice(0, selectionStart ?? value.length).replace(/\D/g, "").length;
        requestAnimationFrame(() => {
            const caret = Math.min(masked.length, digitsBeforeCaret + (digitsBeforeCaret > 2 ? 1 : 0) + (digitsBeforeCaret > 4 ? 1 : 0));
            const input = document.getElementById(inputId);
            if (input instanceof HTMLInputElement) input.setSelectionRange(caret, caret);
        });
        const iso = parseCivilDate(masked);
        if (props.mode === "single") setDraftSingle(current => ({ ...(continuingEdit ? current : splitValue(props.value)), date: iso ?? masked, original: undefined }));
        else if (which === "start") setDraftRange(current => ({ ...current, start: { ...(continuingEdit ? current.start : splitValue(props.value.start)), date: iso ?? masked, original: undefined } }));
        else setDraftRange(current => ({ ...current, end: { ...(continuingEdit ? current.end ?? splitValue(null) : splitValue(props.value.end)), date: iso ?? masked, original: undefined } }));
        setError("");
    }

    function updateTime(which: "start" | "end", value: string) {
        setManuallyEdited(true);
        const update = (parts: DateParts) => ({ ...parts, time: value, timed: true, seconds: value.split(":").length === 3, fraction: undefined, original: undefined });
        if (props.mode === "single") setDraftSingle(current => update(current));
        else if (which === "start") setDraftRange(current => ({ ...current, start: update(current.start) }));
        else setDraftRange(current => ({ ...current, end: update(current.end ?? splitValue(null)) }));
    }

    function enableTime(which: "start" | "end") {
        setManuallyEdited(true);
        const update = (parts: DateParts) => ({ ...parts, timed: true, original: undefined });
        if (props.mode === "single") setDraftSingle(current => update(current));
        else if (which === "start") setDraftRange(current => ({ ...current, start: update(current.start) }));
        else setDraftRange(current => ({ ...current, end: update(current.end ?? splitValue(null)) }));
    }

    function removeTime(which: "start" | "end") {
        setManuallyEdited(true);
        const update = (parts: DateParts) => ({ ...parts, timed: false, time: "00:00", seconds: false, fraction: undefined, original: undefined });
        if (props.mode === "single") setDraftSingle(current => update(current));
        else if (which === "start") setDraftRange(current => ({ ...current, start: update(current.start) }));
        else setDraftRange(current => ({ ...current, end: current.end ? update(current.end) : null }));
    }

    function selectPeriod(start: string, end: string) {
        const clippedStart = minDate && start < dateOnly(minDate) ? dateOnly(minDate) : start;
        const clippedEnd = maxDate && end > dateOnly(maxDate) ? dateOnly(maxDate) : end;
        if (clippedStart > clippedEnd || !withinLimits(clippedStart, minDate, maxDate) || !withinLimits(clippedEnd, minDate, maxDate)) return;
        setDraftRange(current => ({
            start: { ...current.start, date: clippedStart, original: undefined },
            end: { ...(current.end ?? splitValue(null)), date: clippedEnd, original: undefined },
        }));
        setManualStart(prettyDate(clippedStart)); setManualEnd(prettyDate(clippedEnd)); setManuallyEdited(true);
        setShowEnd(true);
        setPendingEnd(false);
    }

    function selectMonth(index: number) {
        const monthStart = isoDate(focusedYear, index, 1);
        if (props.mode === "range") selectPeriod(monthStart, isoDate(focusedYear, index, daysInMonth(focusedYear, index)));
        setCursorMonth({ year: focusedYear, month: index });
    }

    function selectYear(year: number) {
        if (props.mode === "range") selectPeriod(isoDate(year, 0, 1), isoDate(year, 11, 31));
        setFocusedYear(year);
        setCursorMonth(current => ({ ...current, year }));
    }

    function enterDaysForMonth(index: number) {
        if (monthYearClickTimerRef.current) clearTimeout(monthYearClickTimerRef.current);
        setCursorMonth({ year: focusedYear, month: index });
        setView("days");
    }

    function enterMonthsForYear(year: number) {
        if (monthYearClickTimerRef.current) clearTimeout(monthYearClickTimerRef.current);
        setFocusedYear(year);
        setCursorMonth(current => ({ ...current, year }));
        setView("months");
    }

    function deferMonthYearSelection(event: MouseEvent<HTMLButtonElement>, action: () => void) {
        if (monthYearClickTimerRef.current) clearTimeout(monthYearClickTimerRef.current);
        if (event.detail === 0) { action(); return; }
        if (event.detail > 1) return;
        monthYearClickTimerRef.current = setTimeout(action, 240);
    }

    function dayKeyboard(event: KeyboardEvent<HTMLButtonElement>, day: string) {
        const offsets: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
        const offset = offsets[event.key];
        if (!offset) return;
        event.preventDefault();
        const nextDay = addDays(day, offset);
        const [year, month] = dateParts(nextDay);
        setCursorMonth({ year, month });
        requestAnimationFrame(() => document.getElementById(`${id}-day-${nextDay}`)?.focus());
    }

    function field(which: "start" | "end", parts: DateParts, fieldLabel: string) {
        return <div className="min-w-0 flex-1">
            <label htmlFor={`${id}-${which}-popover`} className="mb-1 block text-xs font-semibold text-primary">{fieldLabel}</label>
            <div className="flex items-center gap-1">
                <input id={`${id}-${which}-popover`} type="text" inputMode="numeric" autoComplete="off" placeholder={placeholder} value={parts.date.includes("-") ? prettyDate(parts.date) : parts.date} disabled={disabled}
                    onChange={event => updateInput(which, event.target.value, event.currentTarget.selectionStart, `${id}-${which}-popover`)} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined}
                    className="min-w-0 flex-1 rounded-md border border-input-border bg-input-bg px-2.5 py-2 text-sm text-primary outline-none placeholder:text-secondary focus-visible:border-j-blue-500 focus-visible:ring-2 focus-visible:ring-j-blue-500/30 disabled:cursor-not-allowed disabled:opacity-60" />
                {props.mode === "range" && which === "end" && <button type="button" aria-label="Remover data final" onClick={() => { setShowEnd(false); setDraftRange(current => ({ ...current, end: null })); setError(""); }} className="cursor-pointer rounded p-2 text-secondary hover:bg-j-gray-100 focus-visible:outline-2 focus-visible:outline-j-blue-500"><X size={16}/></button>}
            </div>
            {parts.timed && <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-primary">
                <label htmlFor={`${id}-${which}-time`}>Horário</label>
                <input id={`${id}-${which}-time`} type="time" step="1" value={parts.time} disabled={disabled} onChange={event => updateTime(which, event.target.value)} aria-label={`Horário ${fieldLabel.toLowerCase()}`} className="rounded-md border border-input-border bg-input-bg px-2 py-1.5 text-sm text-primary outline-none focus-visible:ring-2 focus-visible:ring-j-blue-500/30" />
                <button type="button" disabled={disabled} aria-label={`Remover horário ${fieldLabel.toLowerCase()}`} onClick={() => removeTime(which)} className="cursor-pointer rounded p-1 text-secondary hover:bg-j-gray-100 focus-visible:outline-2 focus-visible:outline-j-blue-500 disabled:cursor-not-allowed disabled:opacity-60"><X size={14}/></button>
            </div>}
        </div>;
    }

    return <div className="w-full">
        <label htmlFor={`${id}-outer-start`} className="mb-1.5 block text-sm font-semibold text-primary">{label}</label>
        <Popover.Root open={open} onOpenChange={openPicker}>
            <div className="flex w-full items-center gap-2">
                <input id={`${id}-outer-start`} type="text" inputMode="numeric" autoComplete="off" placeholder={placeholder} value={manualStart} disabled={disabled}
                    aria-label={startLabel} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined}
                    onChange={event => updateInput("start", event.target.value, event.currentTarget.selectionStart, `${id}-outer-start`)}
                    onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); apply(); } }}
                    className="min-h-11 min-w-0 flex-1 rounded-lg border border-input-border bg-input-bg px-3 py-2 text-sm text-primary outline-none placeholder:text-secondary focus-visible:border-j-blue-500 focus-visible:ring-2 focus-visible:ring-j-blue-500/30 disabled:cursor-not-allowed disabled:opacity-60" />
                {props.mode === "range" && showEnd && <>
                    <input id={`${id}-outer-end`} type="text" inputMode="numeric" autoComplete="off" placeholder={placeholder} value={manualEnd} disabled={disabled}
                        aria-label={endLabel} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined}
                        onChange={event => updateInput("end", event.target.value, event.currentTarget.selectionStart, `${id}-outer-end`)}
                        onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); apply(); } }}
                        className="min-h-11 min-w-0 flex-1 rounded-lg border border-input-border bg-input-bg px-3 py-2 text-sm text-primary outline-none placeholder:text-secondary focus-visible:border-j-blue-500 focus-visible:ring-2 focus-visible:ring-j-blue-500/30 disabled:cursor-not-allowed disabled:opacity-60" />
                </>}
                {props.mode === "range" && !showEnd && <button type="button" aria-label="Adicionar data final" disabled={disabled} onClick={() => { setShowEnd(true); setDraftRange(current => ({ ...current, end: splitValue(null) })); }} className="inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-input-border bg-input-bg text-secondary hover:bg-j-gray-100 focus-visible:outline-2 focus-visible:outline-j-blue-500 disabled:cursor-not-allowed disabled:opacity-60"><Plus size={16}/></button>}
                <Popover.Trigger asChild>
                    <button type="button" disabled={disabled} aria-label={`Abrir calendário: ${label}`} aria-haspopup="dialog" aria-expanded={open}
                        className="inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-input-border bg-input-bg text-secondary hover:bg-j-gray-100 focus-visible:outline-2 focus-visible:outline-j-blue-500 disabled:cursor-not-allowed disabled:opacity-60">
                        <CalendarDays size={17} aria-hidden="true" />
                    </button>
                </Popover.Trigger>
            </div>
            <style>{`@media (max-width: 639px) {
                    [data-radix-popper-content-wrapper]:has([data-date-picker-sheet]) {
                        position: fixed !important; inset: auto 0 0 !important;
                        transform: none !important; min-width: 0 !important;
                    }
                }`}</style>
            <Popover.Portal>
                <Popover.Content sideOffset={6} align="start" onOpenAutoFocus={event => { event.preventDefault(); document.getElementById(`${id}-start-popover`)?.focus(); }}
                    data-date-picker-sheet="" className="z-50 max-h-[calc(100dvh-1rem)] w-full overflow-y-auto overscroll-contain rounded-t-xl border border-j-gray-200 bg-j-white p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] text-primary shadow-xl outline-none sm:max-h-[min(calc(100dvh-1rem),var(--radix-popover-content-available-height))] sm:w-[min(21rem,calc(100vw-1rem))] sm:rounded-xl" aria-label={label}>
                    <div className="mb-3 flex gap-2">
                        {field("start", props.mode === "single" ? draftSingle : draftRange.start, showEnd ? "Data inicial" : "Data")}
                        {props.mode === "range" && showEnd && field("end", draftRange.end ?? splitValue(null), "Data final")}
                        {props.mode === "range" && !showEnd && <button type="button" aria-label="Adicionar data final" onClick={() => { setShowEnd(true); setDraftRange(current => ({ ...current, end: splitValue(null) })); }} className="mt-5 inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-md border border-input-border text-primary hover:bg-j-gray-100 focus-visible:outline-2 focus-visible:outline-j-blue-500"><Plus size={16}/></button>}
                    </div>
                    <div className="mb-2 flex items-center justify-between gap-1">
                        <button type="button" aria-label="Período anterior" onClick={() => navigate(-1)} className="cursor-pointer rounded-md p-2 hover:bg-j-gray-100 focus-visible:outline-2 focus-visible:outline-j-blue-500"><ChevronLeft size={18}/></button>
                        <div className="flex items-center gap-1">
                            {view === "years" ? <span className="px-1 text-sm font-bold">{focusedYear - 5} – {focusedYear + 6}</span> : <>
                                <button type="button" onClick={() => setView(view === "days" ? "months" : "years")} className="cursor-pointer rounded-md px-1.5 py-1 text-sm font-bold hover:bg-j-gray-100 focus-visible:outline-2 focus-visible:outline-j-blue-500">{MONTHS[cursorMonth.month]}</button>
                                <button type="button" onClick={() => { setFocusedYear(cursorMonth.year); setView("years"); }} className="cursor-pointer rounded-md px-1.5 py-1 text-sm font-bold hover:bg-j-gray-100 focus-visible:outline-2 focus-visible:outline-j-blue-500">{cursorMonth.year}</button>
                            </>}
                        </div>
                        <button type="button" aria-label="Próximo período" onClick={() => navigate(1)} className="cursor-pointer rounded-md p-2 hover:bg-j-gray-100 focus-visible:outline-2 focus-visible:outline-j-blue-500"><ChevronRight size={18}/></button>
                    </div>
                    <div onWheel={handleScroll} className="select-none">
                        {view === "days" && <>
                            <div className="mb-1 grid grid-cols-7 text-center text-xs font-semibold text-secondary">{["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map(day => <span key={day} className="py-1" aria-hidden="true">{day}</span>)}</div>
                            <div role="group" aria-label={`${MONTHS[cursorMonth.month]} ${cursorMonth.year}`} className="grid grid-cols-7 gap-y-1">
                                {visibleDates.map(day => {
                                    const [, month, date] = dateParts(day);
                                    const isCurrentMonth = month === cursorMonth.month;
                                    const selectedValues = props.mode === "single" ? [draftSingle.date] : [draftRange.start.date, draftRange.end?.date ?? ""];
                                    const isStart = Boolean(selectedValues[0] && day === selectedValues[0]);
                                    const isEnd = Boolean(selectedValues[1] && day === selectedValues[1]);
                                    const inRange = Boolean(selectedValues[0] && selectedValues[1] && day > selectedValues[0] && day < selectedValues[1]);
                                    const selected = isStart || isEnd;
                                    const unavailable = !withinLimits(day, minDate, maxDate);
                                    return <button key={day} id={`${id}-day-${day}`} type="button" aria-label={`${prettyDate(day)}${day === today ? ", hoje" : ""}`} aria-pressed={selected} aria-current={day === today ? "date" : undefined} disabled={unavailable}
                                            onClick={() => selectDay(day)} onDoubleClick={() => { if (props.mode === "single") { const value = toCanonical({ ...draftSingle, date: day, original: undefined }, draftSingle.timed); if (value && withinLimits(day, minDate, maxDate)) { if (props.onChange(value) !== false) setOpen(false); } } else { const startParts = { ...draftRange.start, date: day, original: undefined }; const endParts = { ...(draftRange.end ?? splitValue(null)), date: day, original: undefined }; const start = toCanonical(startParts, startParts.timed); const end = toCanonical(endParts, endParts.timed); if (start && end && withinLimits(day, minDate, maxDate)) { if (props.onChange({ start, end }) !== false) setOpen(false); } } }} onKeyDown={event => dayKeyboard(event, day)}
                                        className={`relative mx-auto flex size-[min(2.25rem,12vw)] cursor-pointer items-center justify-center rounded-full text-sm outline-none focus-visible:ring-2 focus-visible:ring-j-blue-500 disabled:cursor-not-allowed disabled:opacity-30 ${!isCurrentMonth ? "text-secondary" : ""} ${inRange ? "rounded-none bg-j-blue-100 text-j-blue-900" : ""} ${selected ? "bg-j-blue-800 font-bold text-white" : "hover:bg-j-gray-100"} ${day === today ? "ring-1 ring-inset ring-j-yellow-500 font-bold" : ""}`}>
                                        {date}
                                    </button>;
                                })}
                            </div>
                        </>}
                        {view === "months" && <div className="grid grid-cols-3 gap-2" aria-label="Meses">
                            {SHORT_MONTHS.map((month, index) => <button key={month} type="button" onClick={event => deferMonthYearSelection(event, () => selectMonth(index))} onDoubleClick={() => enterDaysForMonth(index)} aria-label={`${month} ${focusedYear}; clique duplo ou use o botão Abrir dias do mês focado`} className={`cursor-pointer rounded-lg py-3 text-sm hover:bg-j-gray-100 focus-visible:outline-2 focus-visible:outline-j-blue-500 ${index === cursorMonth.month ? "bg-j-blue-800 font-bold text-white" : ""}`}>{month}</button>)}
                            <button type="button" onClick={() => setView("days")} className="col-span-3 rounded-md py-2 text-xs font-semibold text-j-blue-700 underline">Abrir dias do mês focado</button>
                        </div>}
                        {view === "years" && <div className="grid grid-cols-3 gap-2" aria-label="Anos">
                            {Array.from({ length: 12 }, (_, index) => focusedYear - 5 + index).map(year => <button key={year} type="button" onClick={event => deferMonthYearSelection(event, () => selectYear(year))} onDoubleClick={() => enterMonthsForYear(year)} aria-label={`${year}; clique duplo ou use o botão Abrir meses do ano focado`} className={`cursor-pointer rounded-lg py-3 text-sm hover:bg-j-gray-100 focus-visible:outline-2 focus-visible:outline-j-blue-500 ${year === cursorMonth.year ? "bg-j-blue-800 font-bold text-white" : ""}`}>{year}</button>)}
                            <button type="button" onClick={() => setView("months")} className="col-span-3 rounded-md py-2 text-xs font-semibold text-j-blue-700 underline">Abrir meses do ano focado</button>
                        </div>}
                    </div>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-1 border-t border-j-gray-200 pt-3">
                        <button type="button" onClick={resetDraft} className="cursor-pointer rounded-md px-3 py-2 text-sm font-semibold text-secondary hover:bg-j-gray-100 focus-visible:outline-2 focus-visible:outline-j-blue-500">Resetar</button>
                        <div className="flex items-center gap-2">
                            {props.mode === "single" && !draftSingle.timed && <button type="button" onClick={() => enableTime("start")} className="inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-2 text-xs font-semibold text-secondary hover:bg-j-gray-100 focus-visible:outline-2 focus-visible:outline-j-blue-500"><Clock3 size={14}/>Adicionar horário</button>}
                            {props.mode === "range" && ((!draftRange.start.timed) || (showEnd && !draftRange.end?.timed)) && <button type="button" onClick={() => enableTime(!draftRange.start.timed ? "start" : "end")} className="inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-2 text-xs font-semibold text-secondary hover:bg-j-gray-100 focus-visible:outline-2 focus-visible:outline-j-blue-500"><Clock3 size={14}/>Adicionar horário{draftRange.start.timed ? " final" : ""}</button>}
                            <button type="button" onClick={apply} className="cursor-pointer rounded-md bg-j-blue-800 px-4 py-2 text-sm font-bold text-white hover:bg-j-blue-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-j-yellow-400">Aplicar</button>
                        </div>
                    </div>
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
        {error && <p id={`${id}-error`} role="alert" className="mt-1 text-xs font-semibold text-input-error-text">{error}</p>}
    </div>;
}
