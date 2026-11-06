'use client';

import { DateField } from '@heroui/react/date-field';
import { DateRangePicker as HeroDateRangePicker, type DateRangePickerProps as HeroDateRangePickerProps } from '@heroui/react/date-range-picker';
import { FieldError } from '@heroui/react/field-error';
import { Label } from '@heroui/react/label';
import { RangeCalendar } from '@heroui/react/range-calendar';
import type { DateValue } from '@internationalized/date';
import { useRef, type ReactNode } from 'react';
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
    const previous = useRef<{ start: DateValue; end: DateValue } | null>(props.value ?? props.defaultValue ?? null);
    return <I18nProvider locale="pt-BR">
        <HeroDateRangePicker {...props} onChange={next => {
            const normalize = <V extends DateValue>(value: V, old: DateValue | undefined): V => value && 'hour' in value && old && 'hour' in old && (value.hour !== old.hour || value.minute !== old.minute)
                ? value.set({ second: 0, millisecond: 0 }) as V : value;
            const old = props.value !== undefined ? props.value : previous.current;
            const updated = next ? { start: normalize(next.start, old?.start), end: normalize(next.end, old?.end) } : null;
            previous.current = updated;
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
            <HeroDateRangePicker.Popover className="jeep-calendar-popover">
                <div className="jeep-calendar-fields">
                    <DateField.Group>
                        <DateField.Input slot="start" aria-label={`Editar início: ${label}`}>{segment => <DateField.Segment segment={segment} />}</DateField.Input>
                    </DateField.Group>
                    <DateField.Group>
                        <DateField.Input slot="end" aria-label={`Editar término: ${label}`}>{segment => <DateField.Segment segment={segment} />}</DateField.Input>
                    </DateField.Group>
                </div>
                <RangeCalendar aria-label={label} minValue={props.minValue} maxValue={props.maxValue} isDateUnavailable={props.isDateUnavailable}>
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
                </RangeCalendar>
            </HeroDateRangePicker.Popover>
            </>}
        </HeroDateRangePicker>
    </I18nProvider>;
}
