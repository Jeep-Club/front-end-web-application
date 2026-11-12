'use client';

import { DateField } from '@heroui/react/date-field';
import { DateRangePicker as HeroDateRangePicker, type DateRangePickerProps as HeroDateRangePickerProps } from '@heroui/react/date-range-picker';
import { FieldError } from '@heroui/react/field-error';
import { Label } from '@heroui/react/label';
import { RangeCalendar } from '@heroui/react/range-calendar';
import type { DateValue } from '@internationalized/date';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Time, toCalendarDateTime } from '@internationalized/date';
import { MobileDateAdvance, MobileRangeSelection, MobileSheetHeader, MobileSheetFooter, MobileTimeClock, TimeWheels, type MobileSheetPhase } from './CalendarControls';
import { I18nProvider } from 'react-aria-components/I18nProvider';
import { Text } from 'react-aria-components/Text';
import { twMerge } from 'tailwind-merge';

export type DateRangePickerProps<T extends DateValue = DateValue> = Omit<HeroDateRangePickerProps<T>, 'children' | 'className'> & {
    label: string;
    description?: ReactNode;
    errorMessage?: ReactNode;
    className?: string;
};

/** Intervalo completo do HeroUI. onChange recebe {start, end} ou null, sem etapa própria de confirmação. */
export function DateRangePicker<T extends DateValue = DateValue>({ label, description, errorMessage, className, ...props }: DateRangePickerProps<T>) {
    const container = useRef<HTMLDivElement>(null);
    const [portalContainer, setPortalContainer] = useState<Element>();
    useEffect(() => { setPortalContainer(container.current?.closest('dialog') ?? undefined); }, []);
    const [activeTime, setActiveTime] = useState<'start' | 'end'>('start');
    const [phase, setPhase] = useState<MobileSheetPhase>('date');
    const [rangeIncomplete, setRangeIncomplete] = useState(false);
    const [calendarKey, setCalendarKey] = useState(0);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [stored, setStored] = useState<{ start: T; end: T } | null>(props.defaultValue ?? null);
    const [draft, setDraft] = useState<{ start: T; end: T } | null>(null);
    const previous = useRef<{ start: DateValue; end: DateValue } | null>(props.value ?? props.defaultValue ?? null);
    const placeholderValue = props.placeholderValue && props.granularity && props.granularity !== 'day' && !('hour' in props.placeholderValue)
        ? toCalendarDateTime(props.placeholderValue) as T
        : props.placeholderValue;
    return <div ref={container} className="w-full min-w-0"><I18nProvider locale="pt-BR">
        <HeroDateRangePicker {...props} defaultValue={undefined} value={isMobileOpen ? draft : props.value !== undefined ? props.value : stored} onOpenChange={open => { if (open && window.matchMedia("(max-width: 640px)").matches) { setDraft(props.value !== undefined ? props.value : stored); setIsMobileOpen(true); setPhase("date"); setActiveTime("start"); } else if (!open) { setIsMobileOpen(false); setPhase("date"); setActiveTime("start"); } props.onOpenChange?.(open); }} placeholderValue={placeholderValue} shouldCloseOnSelect={!isMobileOpen && (props.granularity === undefined || props.granularity === "day")} onChange={next => {
            const normalize = <V extends DateValue>(value: V, old: DateValue | undefined): V => value && 'hour' in value && old && 'hour' in old && (value.hour !== old.hour || value.minute !== old.minute)
                ? value.set({ second: 0, millisecond: 0 }) as V : value;
            const old = isMobileOpen ? draft : props.value !== undefined ? props.value : previous.current;
            const updated = next ? { start: normalize(next.start, old?.start), end: normalize(next.end, old?.end) } : null;
            if (isMobileOpen) { setDraft(updated as { start: T; end: T } | null); return; }
            previous.current = updated;
            setStored(updated as { start: T; end: T } | null);
            props.onChange?.(updated);
        }} granularity={props.granularity === 'second' ? 'minute' : props.granularity} hourCycle={24} className={twMerge('jeep-date-control w-full min-w-0', className)}>
            {({ state }) => <>
            <Label className="text-xs font-bold text-primary md:text-sm">{label}</Label>
            <DateField.Group onClick={event => { if (!(event.target as HTMLElement).closest('button') && !props.isDisabled && !props.isReadOnly) state.setOpen(true); }}>
                <DateField.InputContainer>
                    <DateField.Input slot="start">{segment => <DateField.Segment segment={segment} />}</DateField.Input>
                    <HeroDateRangePicker.RangeSeparator />
                    <DateField.Input slot="end">{segment => <DateField.Segment segment={segment} />}</DateField.Input>
                </DateField.InputContainer>
                <DateField.Suffix>
                    <HeroDateRangePicker.Trigger aria-label={`Abrir calendário: ${label}`}>
                        <HeroDateRangePicker.TriggerIndicator />
                    </HeroDateRangePicker.Trigger>
                </DateField.Suffix>
            </DateField.Group>
            {description && <Text slot="description" className="text-sm text-secondary">{description}</Text>}
            <FieldError className="text-sm text-input-error-text">{errorMessage}</FieldError>
            <HeroDateRangePicker.Popover UNSTABLE_portalContainer={portalContainer} className="jeep-calendar-popover jeep-range-popover">
                <div className="jeep-sheet-backdrop" onClick={() => state.setOpen(false)} />
                <MobileSheetHeader title={label} phase={phase} hasTime={state.hasTime} onPhaseChange={setPhase} onClose={() => state.setOpen(false)} activeTime={activeTime} onActiveTimeChange={setActiveTime}><div className="jeep-calendar-fields">
                    <DateField.Group>
                        <DateField.Input slot="start" aria-label={`Editar início: ${label}`}>{segment => <DateField.Segment segment={segment} />}</DateField.Input>
                    </DateField.Group>
                    <DateField.Group>
                        <DateField.Input slot="end" aria-label={`Editar término: ${label}`}>{segment => <DateField.Segment segment={segment} />}</DateField.Input>
                    </DateField.Group>
                </div></MobileSheetHeader>
                <div className="jeep-sheet-body"><div className="jeep-calendar-content" data-mobile-clock={phase !== "date"}><div className="jeep-calendar-date"><RangeCalendar key={calendarKey} aria-label={label} minValue={props.minValue} maxValue={props.maxValue} isDateUnavailable={props.isDateUnavailable}>
                    <MobileRangeSelection onIncompleteChange={setRangeIncomplete} />
                    <RangeCalendar.Header>
                        <RangeCalendar.YearPickerTrigger>
                            <RangeCalendar.YearPickerTriggerHeading />
                            <RangeCalendar.YearPickerTriggerIndicator />
                        </RangeCalendar.YearPickerTrigger>
                        <RangeCalendar.NavButton slot="previous" />
                        <RangeCalendar.NavButton slot="next" />
                    </RangeCalendar.Header>
                    <RangeCalendar.Grid>
                        <RangeCalendar.GridHeader>{day => <RangeCalendar.HeaderCell>{day}</RangeCalendar.HeaderCell>}</RangeCalendar.GridHeader>
                        <RangeCalendar.GridBody>{date => <RangeCalendar.Cell date={date} />}</RangeCalendar.GridBody>
                    </RangeCalendar.Grid>
                    <RangeCalendar.YearPickerGrid><RangeCalendar.YearPickerGridBody>{({ year }) => <RangeCalendar.YearPickerCell year={year} />}</RangeCalendar.YearPickerGridBody></RangeCalendar.YearPickerGrid>
                </RangeCalendar>{state.hasTime && <button type="button" className="jeep-mobile-select-time" onClick={() => { setActiveTime("start"); setPhase("hours"); }}>Selecionar horários</button>}</div>{state.hasTime && <><MobileDateAdvance dateKey={state.dateRange?.start && state.dateRange?.end ? state.dateRange.start.toString().split("T")[0] + "/" + state.dateRange.end.toString().split("T")[0] : ""} isOpen={state.isOpen} onAdvance={() => { if (!state.timeRange?.start || !state.timeRange?.end) state.setTimeRange({ start: state.timeRange?.start ?? new Time(0, 0), end: state.timeRange?.end ?? new Time(0, 0) }); setActiveTime("start"); setPhase("hours"); }} /><div className="jeep-time-panel jeep-desktop-time"><div className="jeep-time-parts" role="group" aria-label="Horário do intervalo"><button type="button" aria-pressed={activeTime === "start"} onClick={() => setActiveTime("start")}>Início</button><button type="button" aria-pressed={activeTime === "end"} onClick={() => setActiveTime("end")}>Fim</button></div><TimeWheels value={state.timeRange?.[activeTime] ? new Time(state.timeRange[activeTime]!.hour, state.timeRange[activeTime]!.minute) : null} onChange={value => state.setTime(activeTime, value)} onMinuteSelected={() => { if (activeTime === "start") setActiveTime("end"); }} /></div>{phase !== "date" && <MobileTimeClock phase={phase} onPhaseChange={setPhase} label={activeTime === "start" ? "início" : "fim"} value={state.timeRange?.[activeTime] ? new Time(state.timeRange[activeTime]!.hour, state.timeRange[activeTime]!.minute) : null} onChange={value => state.setTime(activeTime, value)} />}</>}</div></div>
            <MobileSheetFooter onClear={() => { state.setValue(null); setActiveTime("start"); setPhase("date"); setRangeIncomplete(false); setCalendarKey(value => value + 1); }} isDisabled={state.isInvalid || rangeIncomplete || !!(state.dateRange?.start && !state.dateRange?.end)} onConfirm={() => { const current = props.value !== undefined ? props.value : stored; if (draft?.start.toString() !== current?.start.toString() || draft?.end.toString() !== current?.end.toString()) { previous.current = draft; setStored(draft); props.onChange?.(draft as Parameters<NonNullable<typeof props.onChange>>[0]); } state.setOpen(false); }} />
            <button type="button" disabled={props.isDisabled || props.isReadOnly} onClick={() => { state.setValue(null); setActiveTime("start"); }} className="jeep-desktop-clear mt-2 cursor-pointer rounded-md px-2 py-1 text-sm font-semibold text-primary hover:bg-background-tertiary focus-visible:outline-2 focus-visible:outline-input-border-focus disabled:cursor-not-allowed disabled:opacity-50">Limpar</button>
            </HeroDateRangePicker.Popover>
            </>}
        </HeroDateRangePicker>
    </I18nProvider></div>;
}
