import { notFound } from 'next/navigation';
import { FeedFormRoute } from '@/components/pages/feed/FeedFormRoute';
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
 const { id } = await params;
 if (!/^\d+$/.test(id) || !Number.isSafeInteger(Number(id)) || Number(id) <= 0) notFound();
 return <FeedFormRoute mode="edit" id={Number(id)} />;
}
