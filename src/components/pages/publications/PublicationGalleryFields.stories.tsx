import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { PublicationGalleryFields } from './PublicationGalleryFields';
import type { PublicationGalleryItem } from '@/utils/publications/gallery';
const saved: PublicationGalleryItem[] = [0, 1].map(index => ({ id: String(index), kind: 'saved', storageKey: index ? '/images/logo_grande.jpg' : '/images/hero-jeep.jpg' }));
const meta = { title: 'Publicações/Galeria', component: PublicationGalleryFields, args: { items: saved, primaryId: '1', onChange: () => {} }, argTypes: { items: { control: false }, onChange: { control: false }, primaryId: { control: false } }, render: function Gallery(args) { const [items, setItems] = useState(args.items); const [primary, setPrimary] = useState(args.primaryId); return <PublicationGalleryFields {...args} items={items} primaryId={primary} onChange={(next, cover) => { setItems(next); setPrimary(cover); }} />; } } satisfies Meta<typeof PublicationGalleryFields>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Retidas: Story = {};
export const Erro: Story = { args: { error: 'Envie pelo menos uma imagem.', items: [], primaryId: '' } };
export const Bloqueada: Story = { args: { disabled: true } };
export const Limite: Story = { args: { items: Array.from({ length: 5 }, (_, i) => ({ ...saved[0], id: String(i), storageKey: `/images/hero-jeep.jpg?image=${i}` })) } };

// Local bitmap represents a new cropped file; no upload is triggered by rendering this story.
export const RetidaENova: Story = { args: { items: [saved[0], { id: 'new', kind: 'file', file: new File([Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII='), char => char.charCodeAt(0))], 'nova.png', { type: 'image/png' }) }], primaryId: 'new' } };
