import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { FeedPeriodFilters } from './FeedPeriodFilters';

const meta = {
    title: 'Publications/FeedPeriodFilters', component: FeedPeriodFilters, tags: ['autodocs'], args: { onApply: fn() },
    argTypes: {
        publishedFrom: { control: 'text', description: 'Limite inclusivo UTC Z. Frações são preservadas.' },
        publishedTo: { control: 'text', description: 'Limite inclusivo UTC Z; pode ser usado sozinho.' },
        disabled: { control: 'boolean' },
        onApply: { description: 'Recebe somente limites válidos ou ausência após limpar.' },
    },
} satisfies Meta<typeof FeedPeriodFilters>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Empty: Story = {};
export const OneLimit: Story = { args: { publishedFrom: '2026-10-29T12:00:00Z' } };
export const ExactInterval: Story = { args: { publishedFrom: '2026-10-29T12:00:00.123456Z', publishedTo: '2026-10-29T12:00:00.123456Z' } };
export const Inverted: Story = { args: { publishedFrom: '2026-10-30T12:00:00Z', publishedTo: '2026-10-29T12:00:00Z' }, play: async ({ canvas, userEvent }) => { await userEvent.click(canvas.getByRole('button', { name: 'Aplicar período' })); } };
export const Disabled: Story = { args: { disabled: true } };
