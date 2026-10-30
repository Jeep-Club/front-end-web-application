import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { FeedMetadata } from './FeedMetadata';
import { publicationFeedItemSchema } from '@/schemas/publications/feed';

const notice = publicationFeedItemSchema.parse({ id: 1, type: 'NOTICE', authorUserId: 7, title: 'Aviso', content: 'Comunicado', primaryImage: null, publishedAt: '2026-10-29T12:00:00Z', likeCount: 0, commentCount: 0, likedByMe: false, details: {} });
const meta = { title: 'Publications/FeedMetadata', component: FeedMetadata, tags: ['autodocs'], args: { publication: notice } } satisfies Meta<typeof FeedMetadata>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Notice: Story = {};
export const Event: Story = { args: { publication: { ...notice, type: 'EVENT', details: { startsAt: '2026-11-01T12:00:00Z', endsAt: '2026-11-01T15:00:00Z', status: 'OPEN' } } } };
export const Cancelled: Story = { args: { publication: { ...notice, type: 'EVENT', details: { startsAt: '2026-11-01T12:00:00Z', endsAt: null, status: 'CANCELLED' } } } };
export const InProgress: Story = { args: { publication: { ...notice, type: 'EVENT', details: { startsAt: '2026-11-01T12:00:00Z', endsAt: null, status: 'IN_PROGRESS' } } } };
export const Finished: Story = { args: { publication: { ...notice, type: 'EVENT', details: { startsAt: '2026-11-01T12:00:00Z', endsAt: '2026-11-01T15:00:00Z', status: 'FINISHED' } } } };
export const Service: Story = { args: { publication: { ...notice, type: 'SERVICE', details: { amount: 150, contactPhone: '+55 (12) 99999-9999' } } } };
