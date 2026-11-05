import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { parseDate, parseDateTime, type DateValue } from '@internationalized/date';
import { expect, fn, within } from 'storybook/test';
import { DatePicker, type DatePickerProps } from './index';

function Example(args: DatePickerProps) {
    const [value, setValue] = useState<DateValue | null>(args.defaultValue ?? null);
    return <div className="space-y-3">
        <DatePicker {...args} value={value} onChange={next => { setValue(next); args.onChange?.(next); }} />
        <output aria-label="Data selecionada" className="block text-sm text-secondary">{value?.toString() ?? 'Nenhuma data'}</output>
    </div>;
}

const meta = {
    title: 'Componentes/DatePicker/Data única',
    component: DatePicker,
    tags: ['!autodocs'],
    args: { label: 'Data de publicação', placeholderValue: parseDate('2026-11-01'), onChange: fn() },
    argTypes: {
        label: { control: 'text', type: 'string' },
        description: { control: 'text', table: { type: { summary: 'ReactNode' } } },
        errorMessage: { control: 'text', table: { type: { summary: 'ReactNode' } } },
        isDisabled: { control: 'boolean', type: 'boolean', table: { defaultValue: { summary: 'false' } } },
        isReadOnly: { control: 'boolean', type: 'boolean', table: { defaultValue: { summary: 'false' } } },
        isRequired: { control: 'boolean', type: 'boolean', table: { defaultValue: { summary: 'false' } } },
        granularity: { control: false, table: { type: { summary: "'day' | 'hour' | 'minute' | 'second'" } } },
        hourCycle: { control: false, table: { type: { summary: '12 | 24' } } },
        value: { control: false, table: { type: { summary: 'DateValue | null' } } },
        defaultValue: { control: false, table: { type: { summary: 'DateValue' } } },
        minValue: { control: false, table: { type: { summary: 'DateValue' } } },
        maxValue: { control: false, table: { type: { summary: 'DateValue' } } },
        placeholderValue: { control: false },
        onChange: { control: false, table: { type: { summary: '(value: DateValue | null) => void' } } },
    },
    decorators: [Story => <div className="w-full max-w-lg p-4"><Story /></div>],
    render: args => <Example {...args} />,
} satisfies Meta<typeof DatePicker>;
export default meta;
type Story = StoryObj<typeof meta>;

export const DataUnica: Story = {
    play: async ({ canvas, canvasElement, userEvent, args }) => {
        await userEvent.click(canvas.getByRole('button', { name: /^Abrir calendário: Data de publicação/ }));
        const page = within(canvasElement.ownerDocument.body);
        await userEvent.click(await page.findByRole('button', { name: /15 de novembro de 2026/ }));
        await expect(canvas.getByRole('status', { name: 'Data selecionada' })).toHaveTextContent('2026-11-15');
        await expect(args.onChange).toHaveBeenCalled();
    },
};
export const Preenchida: Story = { args: { defaultValue: parseDate('2026-11-15') } };
export const Desabilitada: Story = { args: { isDisabled: true } };
export const Limites: Story = { args: { minValue: parseDate('2026-11-10'), maxValue: parseDate('2026-11-20'), description: 'Escolha entre 10 e 20 de novembro de 2026.' } };
export const ComHorario: Story = {
    args: { defaultValue: parseDateTime('2026-11-15T14:30:00'), granularity: 'second', hourCycle: 24 },
    argTypes: { granularity: { control: 'select', options: ['day', 'hour', 'minute', 'second'] }, hourCycle: { control: 'radio', options: [12, 24] } },
};
