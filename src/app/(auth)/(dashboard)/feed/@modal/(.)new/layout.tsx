import { FeedInterceptedModal } from '@/components/pages/feed/FeedRouteLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
    return <FeedInterceptedModal>{children}</FeedInterceptedModal>;
}
