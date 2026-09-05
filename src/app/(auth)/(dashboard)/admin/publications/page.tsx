import AdminPublicationsPage from "@/components/pages/admin/publications";
import { listPublicationsAction } from "@/actions/admin/publications/list";
import { parsePublicationSearchParams } from "@/utils/searchParam/admin/publication";

export default async function Page({ searchParams }: { searchParams: Promise<PublicationSearchParams> }) {
    const valid = parsePublicationSearchParams(await searchParams);
    const publications = await listPublicationsAction(valid);
    return <AdminPublicationsPage publications={publications} searchParams={valid} />;
}

