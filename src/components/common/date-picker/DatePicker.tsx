'use client';

import { Calendar } from '@heroui/react/calendar';
import { DateField } from '@heroui/react/date-field';
import { DatePicker as HeroDatePicker, type DatePickerProps as HeroDatePickerProps } from '@heroui/react/date-picker';
import { FieldError } from '@heroui/react/field-error';
import { Label } from '@heroui/react/label';
import type { DateValue } from '@internationalized/date';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { I18nProvider } from 'react-aria-components/I18nProvider';
import { Text } from 'react-aria-components/Text';
import { Time, toCalendarDateTime } from '@internationalized/date';
import { MobileDateAdvance, MobileSheetHeader, MobileSheetFooter, MobileTimeClock, TimeWheels, type MobileSheetPhase } from './CalendarControls';
import { twMerge } from 'tailwind-merge';

export type DatePickerProps<T extends DateValue = DateValue> = Omit<HeroDatePickerProps<T>, 'children' | 'className'> & {
    label: string;
    description?: ReactNode;
    errorMessage?: ReactNode;
    className?: string;
};

/** Data segmentada do HeroUI. Valores e validação seguem React Aria; fusos pertencem ao consumidor. */
export function DatePicker<T extends DateValue = DateValue>({ label, description, errorMessage, className, ...props }: DatePickerProps<T>) {
    const previous = useRef<DateValue | null>(props.value ?? props.defaultValue ?? null);
    const container = useRef<HTMLDivElement>(null);
    const [portalContainer, setPortalContainer] = useState<Element>();
    const [phase, setPhase] = useState<MobileSheetPhase>('date');
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [stored, setStored] = useState<T | null>(props.defaultValue ?? null);
    const [draft, setDraft] = useState<T | null>(null);
    useEffect(() => { setPortalContainer(container.current?.closest('dialog') ?? undefined); }, []);
    const placeholderValue = props.placeholderValue && props.granularity && props.granularity !== 'day' && !('hour' in props.placeholderValue)
        ? toCalendarDateTime(props.placeholderValue) as T
        : props.placeholderValue;
    return <div ref={container} className="w-full min-w-0"><I18nProvider locale="pt-BR">
        <HeroDatePicker {...props} defaultValue={undefined} value={isMobileOpen ? draft : props.value !== undefined ? props.value : stored} onOpenChange={open => { if (open && window.matchMedia("(max-width: 640px)").matches) { setDraft(props.value !== undefined ? props.value : stored); setIsMobileOpen(true); setPhase("date"); } else if (!open) { setIsMobileOpen(false); setPhase("date"); } props.onOpenChange?.(open); }} placeholderValue={placeholderValue} shouldCloseOnSelect={!isMobileOpen && (props.granularity === undefined || props.granularity === "day")} onChange={next => {
            const old = isMobileOpen ? draft : props.value !== undefined ? props.value : previous.current;
            const updated = next && 'hour' in next && old && 'hour' in old && (next.hour !== old.hour || next.minute !== old.minute)
                ? next.set({ second: 0, millisecond: 0 }) as typeof next : next;
            if (isMobileOpen) { setDraft(updated as T | null); return; }
            previous.current = updated;
            setStored(updated as T | null);
            props.onChange?.(updated);
        }} granularity={props.granularity === 'second' ? 'minute' : props.granularity} hourCycle={24} className={twMerge('jeep-date-control w-full min-w-0', className)}>
            {({ state }) => <>
            <Label className="text-xs font-bold text-primary md:text-sm">{label}{props.isRequired && <span aria-hidden="true" className="text-input-error-text"> *</span>}</Label>
            <DateField.Group onClick={event => { if (!(event.target as HTMLElement).closest('button') && !props.isDisabled && !props.isReadOnly) state.setOpen(true); }}>
                <DateField.Input>{segment => <DateField.Segment segment={segment} />}</DateField.Input>
                <DateField.Suffix>
                    <HeroDatePicker.Trigger aria-label={`Abrir calendário: ${label}`}>
                        <HeroDatePicker.TriggerIndicator />
                    </HeroDatePicker.Trigger>
                </DateField.Suffix>
            </DateField.Group>
            {description && <Text slot="description" className="text-sm text-secondary">{description}</Text>}
            <FieldError className="text-sm text-input-error-text">{errorMessage}</FieldError>
            <HeroDatePicker.Popover UNSTABLE_portalContainer={portalContainer} className="jeep-calendar-popover">
                <div className="jeep-sheet-backdrop" onClick={() => state.setOpen(false)} />
                <MobileSheetHeader title={label} phase={phase} hasTime={state.hasTime} onPhaseChange={setPhase} onClose={() => state.setOpen(false)}><div className="jeep-calendar-fields">
                    <DateField.Group>
                        <DateField.Input aria-label={`Editar data: ${label}`}>{segment => <DateField.Segment segment={segment} />}</DateField.Input>
                    </DateField.Group>
                </div></MobileSheetHeader>
                <div className="jeep-sheet-body"><div className="jeep-calendar-content" data-mobile-clock={phase !== "date"}><div className="jeep-calendar-date"><Calendar aria-label={label} minValue={props.minValue} maxValue={props.maxValue} isDateUnavailable={props.isDateUnavailable}>
                    <Calendar.Header>
                        <Calendar.YearPickerTrigger>
                            <Calendar.YearPickerTriggerHeading />
                            <Calendar.YearPickerTriggerIndicator />
                        </Calendar.YearPickerTrigger>
                        <Calendar.NavButton slot="previous" />
                        <Calendar.NavButton slot="next" />
                    </Calendar.Header>
                    <Calendar.Grid>
                        <Calendar.GridHeader>{day => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}</Calendar.GridHeader>
                        <Calendar.GridBody>{date => <Calendar.Cell date={date} onClick={() => { if (isMobileOpen && state.hasTime && state.dateValue?.toString().split("T")[0] === date.toString()) setPhase("hours"); }} />}</Calendar.GridBody>
                    </Calendar.Grid>
                    <Calendar.YearPickerGrid><Calendar.YearPickerGridBody>{({ year }) => <Calendar.YearPickerCell year={year} />}</Calendar.YearPickerGridBody></Calendar.YearPickerGrid>
                </Calendar>{state.hasTime && <button type="button" className="jeep-mobile-select-time" onClick={() => setPhase("hours")}>Selecionar horário</button>}</div>{state.hasTime && <><MobileDateAdvance dateKey={state.dateValue?.toString().split('T')[0] ?? ''} isOpen={state.isOpen} onAdvance={() => { if (!state.timeValue) state.setTimeValue(new Time(0, 0)); setPhase("hours"); }} /><div className="jeep-desktop-time"><TimeWheels value={state.timeValue ? new Time(state.timeValue.hour, state.timeValue.minute) : null} onChange={value => state.setTimeValue(value)} /></div>{phase !== "date" && <MobileTimeClock phase={phase} onPhaseChange={setPhase} value={state.timeValue ? new Time(state.timeValue.hour, state.timeValue.minute) : null} onChange={value => state.setTimeValue(value)} />}</>}</div></div>
            <MobileSheetFooter onClear={() => state.setValue(null)} isDisabled={state.isInvalid} onConfirm={() => { const current = props.value !== undefined ? props.value : stored; if (draft?.toString() !== current?.toString()) { previous.current = draft; setStored(draft); props.onChange?.(draft as Parameters<NonNullable<typeof props.onChange>>[0]); } state.setOpen(false); }} />
            <button type="button" disabled={props.isDisabled || props.isReadOnly} onClick={() => state.setValue(null)} className="jeep-desktop-clear mt-2 cursor-pointer rounded-md px-2 py-1 text-sm font-semibold text-primary hover:bg-background-tertiary focus-visible:outline-2 focus-visible:outline-input-border-focus disabled:cursor-not-allowed disabled:opacity-50">Limpar</button>
            </HeroDatePicker.Popover>
            </>}
        </HeroDatePicker>
    </I18nProvider></div>;
}
