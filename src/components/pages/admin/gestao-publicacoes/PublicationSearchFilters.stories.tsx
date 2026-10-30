import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { useState } from 'react';
import { PublicationSearchFilters } from './PublicationSearchFilters';

const meta = {
    title: 'Publicações/Pesquisa e filtros', component: PublicationSearchFilters,
    args: { type: 'EVENT', canReadId: true, canReadList: true, onOpenId: fn(), onPeriod: fn(), onClear: fn() },
    argTypes: { type: { control: 'radio', options: ['EVENT', 'NOTICE', 'SERVICE'] }, onOpenId: { control: false }, onPeriod: { control: false }, onClear: { control: false } },
    parameters: { docs: { description: { component: 'Composição da pesquisa de publicações com o organizador compartilhado de filtros. A busca automática interpreta números como ID e textos como título; a pesquisa por título permanece indisponível. Avisos e serviços permitem filtrar o período de publicação. Callbacks são simulados no catálogo, sem navegação ou API.' } } },
    render: function Render(args) {
        const [period, setPeriod] = useState<{ publishedFrom?: string; publishedTo?: string }>({});
        return <PublicationSearchFilters {...args} {...period} onPeriod={next => { setPeriod(next); args.onPeriod(next); }} onClear={() => { setPeriod({}); args.onClear(); }} />;
    },
} satisfies Meta<typeof PublicationSearchFilters>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Eventos: Story = {};
export const Avisos: Story = { args: { type: 'NOTICE' } };
export const Servicos: Story = { args: { type: 'SERVICE' } };
export const SemPermissao: Story = { args: { canReadId: false, canReadList: false } };
