import { Suspense } from "react";
import Feed from "@/components/pages/feed";

export default function FeedPage() {
    return <Suspense fallback={<p className="p-4 text-sm text-j-gray-500">Carregando feed...</p>}><Feed /></Suspense>;
}