import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { Filters } from './Filters';
import { Select } from '@/components/common/select/select';

const filters = ['Estado', 'Categoria', 'Período', 'Responsável'].map(label => ({
    id: label,
    label,
    content: <div className="w-44"><Select name={label} label={label} placeholder="Selecione" options={[{ value: 'all', label: 'Todos' }]} /></div>,
}));

const meta = {
    title: 'Componentes/Filtros', component: Filters,
    args: { filters, onClear: fn(), onRemove: fn() },
    parameters: { docs: { description: { component: 'Organiza filtros fornecidos pela tela: os três primeiros aparecem inicialmente e os demais podem ser adicionados. Os valores e regras pertencem ao consumidor.' } } },
} satisfies Meta<typeof Filters>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Padrao: Story = {};
