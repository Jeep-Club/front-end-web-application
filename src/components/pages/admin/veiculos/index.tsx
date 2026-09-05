"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Car, Eye, Pencil, Plus, ShieldX, Trash2 } from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { Button, ButtonIcon } from "@/components/common/button";
import { Table } from "@/components/common/table";
import { useModal } from "@/providers/ModalProvider";
import { useUserStore } from "@/stores/userStore";
import { hasPermission } from "@/utils/permission/hasPermission";
import { maskPlate } from "@/utils/masks/maskPlate";
import { listVehiclesAdminAction } from "@/actions/admin/vehicles/list";
import { VehicleDetailModal } from "./VehicleDetailModal";
import { EditVehicleModal } from "./EditVehicleModal";
import { CreateVehicleModal } from "./CreateVehicleModal";
import { DeleteVehicleModal } from "./DeleteVehicleModal";

const PAGE_SIZE = 10;

export default function VehicleManagement() {
    const { setContent, setOpen } = useModal();
    const permissions = useUserStore((state) => state.permissions);

    const canRead = hasPermission(permissions, "VEHICLES", "VEHICLE_READ");
    const canCreate = hasPermission(permissions, "VEHICLES", "VEHICLE_CREATE");
    const canUpdate = hasPermission(permissions, "VEHICLES", "VEHICLE_UPDATE");
    const canDelete = hasPermission(permissions, "VEHICLES", "VEHICLE_DELETE");

    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(PAGE_SIZE);

    const { data, isLoading, isFetching, error } = useQuery({
        queryKey: ["admin", "vehicles", { page, size: pageSize }],
        queryFn: () => listVehiclesAdminAction({ page, size: pageSize }),
        placeholderData: (previous) => previous,
        enabled: canRead,
    });

    const handleOpenCreate = () => {
        setContent(<CreateVehicleModal />);
        setOpen();
    };

    const handleOpenDetail = (id: number) => {
        setContent(<VehicleDetailModal vehicleId={id} />);
        setOpen();
    };

    const handleOpenEdit = (id: number) => {
        setContent(<EditVehicleModal vehicleId={id} />);
        setOpen();
    };

    const handleOpenDelete = (vehicle: VehicleListItem) => {
        const label = vehicle.nickname
            ? `${vehicle.model} (${vehicle.nickname}) - ${maskPlate(vehicle.plate)}`
            : `${vehicle.model} - ${maskPlate(vehicle.plate)}`;

        setContent(
            <DeleteVehicleModal
                vehicleId={vehicle.id}
                vehicleLabel={label}
            />,
        );
        setOpen();
    };

    const columns = useMemo<ColumnDef<VehicleListItem, unknown>[]>(() => [
        {
            accessorKey: "photo",
            header: "Foto",
            meta: { label: "Foto" },
            cell: ({ row }) => (
                <div className="flex h-11 w-14 items-center justify-center overflow-hidden rounded-lg border border-j-gray-200 bg-j-gray-100">
                    {row.original.photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={row.original.photo}
                            alt={row.original.nickname || row.original.model}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <Car size={20} className="text-j-gray-400" />
                    )}
                </div>
            ),
        },
        {
            accessorKey: "plate",
            header: "Placa",
            meta: { label: "Placa" },
            cell: ({ row }) => (
                <span className="font-bold tracking-wider text-j-gray-700">
                    {maskPlate(row.original.plate)}
                </span>
            ),
        },
        {
            accessorKey: "model",
            header: "Modelo",
            meta: { label: "Modelo" },
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-bold text-j-gray-700">{row.original.model}</span>
                    {row.original.nickname && (
                        <span className="text-xs text-j-gray-500">{row.original.nickname}</span>
                    )}
                </div>
            ),
        },
        {
            accessorKey: "modelYear",
            header: "Ano/Modelo",
            meta: { label: "Ano/Modelo" },
            cell: ({ row }) => (
                <span className="text-j-gray-700">{row.original.modelYear}</span>
            ),
        },
        {
            accessorKey: "color",
            header: "Cor",
            meta: { label: "Cor" },
            cell: ({ row }) => (
                <span className="text-j-gray-700">{row.original.color}</span>
            ),
        },
        {
            id: "actions",
            header: "Ações",
            meta: { label: "Ações" },
            cell: ({ row }) => {
                const vehicle = row.original;

                return (
                    <div className="flex items-center justify-end gap-1.5">
                        {canRead && (
                            <ButtonIcon
                                type="button"
                                title="Visualizar detalhes"
                                aria-label={`Visualizar detalhes de ${vehicle.model}`}
                                onClick={() => handleOpenDetail(vehicle.id)}
                                className="rounded-lg bg-j-blue-800 p-2 text-j-yellow-300 hover:bg-j-blue-600 hover:text-j-yellow-300"
                            >
                                <Eye size={18} />
                            </ButtonIcon>
                        )}

                        {canUpdate && (
                            <ButtonIcon
                                type="button"
                                title="Editar"
                                aria-label={`Editar ${vehicle.model}`}
                                onClick={() => handleOpenEdit(vehicle.id)}
                                className="rounded-lg bg-yellow-50 p-2 text-yellow-600 hover:bg-yellow-100"
                            >
                                <Pencil size={18} />
                            </ButtonIcon>
                        )}

                        {canDelete && (
                            <ButtonIcon
                                type="button"
                                title="Excluir"
                                aria-label={`Excluir ${vehicle.model}`}
                                onClick={() => handleOpenDelete(vehicle)}
                                className="rounded-lg bg-red-50 p-2 text-red-500 hover:bg-red-100"
                            >
                                <Trash2 size={18} />
                            </ButtonIcon>
                        )}
                    </div>
                );
            },
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
    ], [canRead, canUpdate, canDelete]);

    return (
        <div className="min-h-full w-full p-3 md:p-4">
            <div className="flex w-full flex-col gap-4 pb-6">
                <PageHeader
                    title="Administração de veículos"
                    breadcrumbs={[
                        { label: "Início", href: "/feed" },
                        { label: "Gestão Administrativa", href: "/admin" },
                        { label: "Administração de veículos" },
                    ]}
                />

                {!canRead ? (
                    <section className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-j-gray-300 bg-j-white p-6 text-center">
                        <ShieldX size={42} className="mb-3 text-j-gray-400" />
                        <h3 className="text-lg font-black text-j-blue-800">Acesso não permitido</h3>
                        <p className="mt-1 max-w-md text-sm text-j-gray-600">
                            Seu usuário não possui permissão para visualizar a administração de veículos.
                        </p>
                    </section>
                ) : (
                    <Table.Root
                        data={data?.content ?? []}
                        columns={columns}
                        getRowId={(vehicle) => String(vehicle.id)}
                        pagination={{
                            pageIndex: page,
                            pageSize,
                            pageCount: data?.totalPages ?? 0,
                            rowCount: data?.totalElements,
                            pageSizeOptions: [5, 10, 20, 50, 100],
                            onChange: (next) => {
                                setPage(next.pageIndex);
                                setPageSize(next.pageSize);
                            },
                        }}
                        footer={<Table.Pagination itemLabel="veículo" showCount={false} />}
                        isLoading={isLoading}
                        isFetching={isFetching}
                        error={error ? error.message : undefined}
                        emptyState="Nenhum veículo cadastrado."
                    >
                        <Table.Header
                            title="Veículos cadastrados"
                            description={isLoading ? "Carregando..." : `${data?.totalElements ?? 0} veículo(s) cadastrado(s)`}
                        >
                            {canCreate && (
                                <Button type="button" onClick={handleOpenCreate} className="w-full shrink-0 sm:w-auto">
                                    <Plus size={16} strokeWidth={3} />
                                    Cadastrar veículo
                                </Button>
                            )}
                        </Table.Header>

                        <Table.Content loadingRows={pageSize} />
                    </Table.Root>
                )}
            </div>
        </div>
    );
}
