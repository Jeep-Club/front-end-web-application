'use client';

import { Calendar } from '@heroui/react/calendar';
import { DateField } from '@heroui/react/date-field';
import { DatePicker as HeroDatePicker, type DatePickerProps as HeroDatePickerProps } from '@heroui/react/date-picker';
import { FieldError } from '@heroui/react/field-error';
import { Label } from '@heroui/react/label';
import type { DateValue } from '@internationalized/date';
import { useRef, type ReactNode } from 'react';
import { I18nProvider } from 'react-aria-components/I18nProvider';
import { Text } from 'react-aria-components/Text';
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
    return <I18nProvider locale="pt-BR">
        <HeroDatePicker {...props} onChange={next => {
            const old = props.value !== undefined ? props.value : previous.current;
            const updated = next && 'hour' in next && old && 'hour' in old && (next.hour !== old.hour || next.minute !== old.minute)
                ? next.set({ second: 0, millisecond: 0 }) as typeof next : next;
            previous.current = updated;
            props.onChange?.(updated);
        }} granularity={props.granularity === 'second' ? 'minute' : props.granularity} hourCycle={24} className={twMerge('jeep-date-control w-full min-w-0', className)}>
            {({ state }) => <>
            <Label className="text-xs font-bold text-primary md:text-sm">{label}</Label>
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
            <HeroDatePicker.Popover className="jeep-calendar-popover">
                <div className="jeep-calendar-fields">
                    <DateField.Group>
                        <DateField.Input aria-label={`Editar data: ${label}`}>{segment => <DateField.Segment segment={segment} />}</DateField.Input>
                    </DateField.Group>
                </div>
                <Calendar aria-label={label} minValue={props.minValue} maxValue={props.maxValue} isDateUnavailable={props.isDateUnavailable}>
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
                        <Calendar.GridBody>{date => <Calendar.Cell date={date} />}</Calendar.GridBody>
                    </Calendar.Grid>
                    <Calendar.YearPickerGrid><Calendar.YearPickerGridBody>{({ year }) => <Calendar.YearPickerCell year={year} />}</Calendar.YearPickerGridBody></Calendar.YearPickerGrid>
                </Calendar>
            </HeroDatePicker.Popover>
            </>}
        </HeroDatePicker>
    </I18nProvider>;
}
