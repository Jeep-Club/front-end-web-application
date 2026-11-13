import { notFound } from 'next/navigation';
import { FeedDetailRoute } from '@/components/pages/feed/FeedDetailRoute';
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
 const { id } = await params;
 if (!/^\d+$/.test(id) || !Number.isSafeInteger(Number(id)) || Number(id) <= 0) notFound();
 return <FeedDetailRoute  id={Number(id)} />;
}
