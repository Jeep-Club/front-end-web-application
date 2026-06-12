"use client";

import { useState } from "react";
import { Table } from "@/components/common/table"; // Importando o nosso orquestrador Table
import { createColumnHelper } from "@tanstack/react-table";

// ==========================================
// 1. TIPAGEM E COLUNAS (Definição da Tabela)
// ==========================================
type JeepMember = {
    id: string;
    name: string;
    jeepModel: string;
    role: string;
    status: "Ativo" | "Inativo";
};

const columnHelper = createColumnHelper<JeepMember>();

const columns = [
    columnHelper.accessor("name", {
        header: "Nome do Piloto",
        cell: (info) => <span className="font-semibold">{info.getValue()}</span>,
    }),
    columnHelper.accessor("jeepModel", {
        header: "Veículo (Jeep)",
        cell: (info) => <span className="text-j-yellow-500">{info.getValue()}</span>,
    }),
    columnHelper.accessor("role", {
        header: "Cargo",
    }),
    columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => {
            const status = info.getValue();
            return (
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${status === 'Ativo' ? 'bg-j-green-500/20 text-j-green-400' : 'bg-j-red-500/20 text-j-red-400'}`}>
                    {status}
                </span>
            );
        },
    }),
];

// ==========================================
// 2. DADOS MOCKADOS (Simulando o Backend)
// ==========================================
const mockBackendData = {
    page1: {
        data: [
            { id: "1", name: "João Passos", jeepModel: "Wrangler Rubicon", role: "Presidente", status: "Ativo" },
            { id: "2", name: "Carlos Silva", jeepModel: "Renegade Trailhawk", role: "Membro", status: "Ativo" },
            { id: "3", name: "Ana Souza", jeepModel: "Compass Limited", role: "Tesoureira", status: "Ativo" },
            { id: "4", name: "Marcos Rocha", jeepModel: "Grand Cherokee", role: "Membro", status: "Inativo" },
        ] as JeepMember[],
        paginate: {
            currentPage: 1,
            totalPages: 2,
            totalItems: 8
        }
    },
    page2: {
        data: [
            { id: "5", name: "Lucas Mendes", jeepModel: "Wrangler Sahara", role: "Membro", status: "Ativo" },
            { id: "6", name: "Fernanda Costa", jeepModel: "Renegade Sport", role: "Membro", status: "Ativo" },
            { id: "7", name: "Roberto Alves", jeepModel: "Commander Overland", role: "Membro", status: "Inativo" },
            { id: "8", name: "Juliana Dias", jeepModel: "Compass Longitude", role: "Membro", status: "Ativo" },
        ] as JeepMember[],
        paginate: {
            currentPage: 2,
            totalPages: 2,
            totalItems: 8
        }
    }
};

// ==========================================
// 3. A PÁGINA (Orquestração do Estado)
// ==========================================
export default function TestTablePage() {
    // Estado local para simular a mudança de página que o UseQuery faria
    const [currentPageIndex, setCurrentPageIndex] = useState<1 | 2>(1);
    const [isLoading, setIsLoading] = useState(false);

    // Pegamos os dados da página atual baseados no estado
    const currentBackendResponse = mockBackendData[`page${currentPageIndex}`];

    // Função que simula o loading de rede ao trocar de página
    const handlePageChange = (newPageIndex: number) => {
        setIsLoading(true);
        // Simulando delay de rede de 600ms
        setTimeout(() => {
            setCurrentPageIndex(newPageIndex as 1 | 2);
            setIsLoading(false);
        }, 600);
    };

    return (
        <div className="w-full min-h-screen bg-j-blue-500 p-6 lg:p-12 text-input-text flex justify-center">
            <div className="w-full max-w-5xl flex flex-col gap-4">
                
                {/* Cabeçalho usando o Composition Pattern */}
                <Table.Header 
                    title="Gestão de Membros" 
                />

                {/* Motor de Tabela */}
                <Table.Root 
                    columns={columns} 
                    data={currentBackendResponse.data} 
                    isLoading={isLoading} 
                />

                {/* Controles de Paginação */}
                <Table.Pagination 
                    pageIndex={currentBackendResponse.paginate.currentPage}
                    pageCount={currentBackendResponse.paginate.totalPages}
                    onPageChange={handlePageChange}
                />

            </div>
        </div>
    );
}