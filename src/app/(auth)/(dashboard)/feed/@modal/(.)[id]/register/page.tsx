import { notFound } from 'next/navigation';
import { FeedRegistrationRoute } from '@/components/pages/feed/FeedRegistrationRoute';
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
 const { id } = await params;
 if (!/^\d+$/.test(id) || !Number.isSafeInteger(Number(id)) || Number(id) <= 0) notFound();
 return <FeedRegistrationRoute  id={Number(id)} />;
}
