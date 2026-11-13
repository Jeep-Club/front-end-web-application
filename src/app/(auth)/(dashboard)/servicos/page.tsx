import { Suspense } from "react";
import ServicesPage from "@/components/pages/servicos";

export default function Page() {
    return <Suspense fallback={<div role="status" className="p-6 text-sm text-j-gray-500">Carregando serviços...</div>}><ServicesPage /></Suspense>;
}
