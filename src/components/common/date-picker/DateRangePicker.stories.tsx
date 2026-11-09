import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { parseDate, parseDateTime, type DateValue } from '@internationalized/date';
import { expect, fn, within } from 'storybook/test';
import { DateRangePicker, type DateRangePickerProps } from './index';

function Example(args: DateRangePickerProps) {
    const [value, setValue] = useState<{ start: DateValue; end: DateValue } | null>(args.defaultValue ?? null);
    return <div className="space-y-3">
        <DateRangePicker {...args} value={value} onChange={next => { setValue(next); args.onChange?.(next); }} />
        <output aria-label="Intervalo selecionado" className="block text-sm text-secondary">{value ? `${value.start.toString()} / ${value.end.toString()}` : 'Nenhum intervalo'}</output>
    </div>;
}

const meta = {
    title: 'Componentes/DatePicker/Intervalo',
    component: DateRangePicker,
    tags: ['!autodocs'],
    args: { label: 'Período de publicação', placeholderValue: parseDate('2026-11-01'), onChange: fn() },
    argTypes: {
        label: { control: 'text', type: 'string' },
        description: { control: 'text', table: { type: { summary: 'ReactNode' } } },
        errorMessage: { control: 'text', table: { type: { summary: 'ReactNode' } } },
        isDisabled: { control: 'boolean', type: 'boolean', table: { defaultValue: { summary: 'false' } } },
        isReadOnly: { control: 'boolean', type: 'boolean', table: { defaultValue: { summary: 'false' } } },
        isRequired: { control: 'boolean', type: 'boolean', table: { defaultValue: { summary: 'false' } } },
        granularity: { control: false, table: { type: { summary: "'day' | 'hour' | 'minute' | 'second'" } } },
        hourCycle: { control: false, table: { type: { summary: '12 | 24' } } },
        value: { control: false, table: { type: { summary: '{ start: DateValue; end: DateValue } | null' } } },
        defaultValue: { control: false, table: { type: { summary: '{ start: DateValue; end: DateValue }' } } },
        minValue: { control: false, table: { type: { summary: 'DateValue' } } },
        maxValue: { control: false, table: { type: { summary: 'DateValue' } } },
        placeholderValue: { control: false },
        onChange: { control: false, table: { type: { summary: '(value: { start: DateValue; end: DateValue } | null) => void' } } },
    },
    decorators: [Story => <div className="w-full max-w-xl p-4"><Story /></div>],
    render: args => <Example {...args} />,
} satisfies Meta<typeof DateRangePicker>;
export default meta;
type Story = StoryObj<typeof meta>;

export const IntervaloVazio: Story = {
    play: async ({ canvas, canvasElement, userEvent, args }) => {
        await userEvent.click(canvas.getByRole('button', { name: /^Abrir calendário: Período de publicação/ }));
        const page = within(canvasElement.ownerDocument.body);
        await userEvent.click(await page.findByRole('button', { name: /15 de novembro de 2026/ }));
        await expect(args.onChange).not.toHaveBeenCalled();
        await userEvent.click(page.getByRole('button', { name: /20 de novembro de 2026/ }));
        await expect(canvas.getByRole('status', { name: 'Intervalo selecionado' })).toHaveTextContent('2026-11-15 / 2026-11-20');
        await expect(args.onChange).toHaveBeenCalled();
    },
};
export const IntervaloPreenchido: Story = { args: { defaultValue: { start: parseDate('2026-11-01'), end: parseDate('2026-11-15') } } };
export const Desabilitado: Story = { args: { isDisabled: true } };
export const Limites: Story = { args: { minValue: parseDate('2026-11-10'), maxValue: parseDate('2026-11-20'), description: 'O intervalo deve ficar entre 10 e 20 de novembro de 2026.' } };
export const ComHorario: Story = {
    args: { defaultValue: { start: parseDateTime('2026-11-15T14:30:00'), end: parseDateTime('2026-11-16T18:45:30') }, granularity: 'second', hourCycle: 24 },
    parameters: { docs: { description: { story: 'Abra o calendário para selecionar data, horas e minutos.' } } },
};
