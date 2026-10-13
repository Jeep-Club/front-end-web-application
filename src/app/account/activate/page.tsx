import ActivateInvitation from '@/components/pages/account/ActivateInvitation';

export default async function Page({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
    const { token } = await searchParams;
    return <ActivateInvitation token={token ?? ''} />;
}
