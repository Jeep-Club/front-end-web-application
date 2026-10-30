import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { useState } from 'react';
import { PublicationList, type PublicationListItem } from './PublicationList';

const items: PublicationListItem[] = [
    { id: 7, type: 'EVENT', title: 'Trilha de integração e encontro dos associados', content: 'Ponto de encontro e orientações para a trilha.', status: 'DRAFT', eventStatus: 'OPEN', startsAt: '2099-11-15T11:00:00Z', images: [{ storageKey: '/images/hero-jeep.jpg', position: 0, primary: true }] },
    { id: 8, type: 'NOTICE', title: 'Comunicado aos associados', content: 'Comunicado publicado para consulta.', status: 'PUBLISHED', publishedAt: '2026-10-30T12:00:00Z', images: [] },
];
const meta = {
    title: 'Publicações/Listagem administrativa', component: PublicationList,
    args: { page: { content: items, totalElements: 2, totalPages: 1, number: 0, size: 12, first: true, last: true, numberOfElements: 2, empty: false }, pageIndex: 0, pageSize: 12, onPaginationChange: fn(), onViewChange: fn(), view: 'list' },
    argTypes: { view: { control: 'radio', options: ['list', 'grid'], description: 'Apresentação; a troca não consulta dados.' }, page: { control: 'object', description: 'Página da API e seus totais, sem agregação ou filtros locais.' }, onPaginationChange: { control: false }, onViewChange: { control: false }, onRetry: { control: false } },
    parameters: { docs: { description: { component: 'Lista compacta ou grade para as três categorias. Usa imagens autenticadas na aplicação; os exemplos usam assets locais. Datas e estados aparecem somente quando fornecidos pelo contrato.' } } },
} satisfies Meta<typeof PublicationList>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Lista: Story = {};
export const Grade: Story = { args: { view: 'grid' } };
export const Alternancia: Story = { render: function Render(args) { const [view, setView] = useState<'list' | 'grid'>('list'); const [direction, setDirection] = useState<'asc' | 'desc'>('desc'); return <PublicationList {...args} view={view} onViewChange={next => { setView(next); args.onViewChange?.(next); }} ordering={{ direction, title: `Ordenado pela data de criação, ${direction === 'desc' ? 'mais recentes' : 'mais antigas'} primeiro. Clique para inverter.`, onChange: setDirection }} />; } };
export const OrdenacaoFixaDoFeed: Story = { args: { ordering: { direction: 'desc', title: 'Ordenado pela data de publicação, mais recentes primeiro. A API ainda não permite inverter a ordem.' } } };
export const Carregando: Story = { args: { page: undefined, isLoading: true } };
export const Erro: Story = { args: { page: undefined, error: 'Não foi possível carregar as publicações.', onRetry: fn() } };
export const Vazia: Story = { args: { page: { content: [], totalElements: 0, totalPages: 0, number: 0, size: 12, first: true, last: true, numberOfElements: 0, empty: true } } };
