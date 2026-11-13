import { FeedRouteLayout } from '@/components/pages/feed/FeedRouteLayout';

export default function FeedLayout({ children, modal }: { children: React.ReactNode; modal: React.ReactNode }) {
    return <FeedRouteLayout modal={modal}>{children}</FeedRouteLayout>;
}
