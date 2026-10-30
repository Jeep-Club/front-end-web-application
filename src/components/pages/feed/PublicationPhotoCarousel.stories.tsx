import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { PublicationPhotoCarousel } from './PublicationPhotoCarousel';

// Local assets are presentation fixtures; production receives authenticated storageKeys.
const meta = { title: 'Publications/PublicationPhotoCarousel', component: PublicationPhotoCarousel, tags: ['autodocs'], args: { title: 'Fotos da publicação', images: [{ storageKey: '/images/hero-jeep.jpg', position: 0 }] } } satisfies Meta<typeof PublicationPhotoCarousel>;
export default meta;
type Story = StoryObj<typeof meta>;
export const OnePhoto: Story = {};
export const Empty: Story = { args: { images: [] } };
export const Multiple: Story = { args: { images: [{ storageKey: '/images/hero-jeep.jpg', position: 1 }, { storageKey: '/images/logo_grande.jpg', position: 0 }] } };
export const Unavailable: Story = { args: { images: [{ storageKey: '/images/missing-feed-fixture.jpg', position: 0 }] } };
