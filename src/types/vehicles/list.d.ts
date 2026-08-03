/**
 * Item resumido da listagem (ListResponseDTO) — nao e' o veiculo completo,
 * so os campos usados pra exibir a lista. Detalhes completos vem de outro
 * endpoint (GET vehicles/detail/...) quando ele existir.
 */
interface VehicleListItem {
    id: number;
    nickname: string | null;
    plate: string;
    photo: string | null;
    modelYear: number;
    model: string;
    color: string;
}

type ListVehicleMemberResponse = PageResponse<VehicleListItem>;
