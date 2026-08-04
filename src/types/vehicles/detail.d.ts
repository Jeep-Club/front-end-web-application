// Espelha o DetailResponseDTO retornado por GET /vehicles/detail/member/{vehicleId}.
// Diferente do detail-for-edit: esse endpoint e' pra tela de visualizacao (readonly),
// nao pra alimentar o formulario de edicao.
interface VehicleDetail {
    id: number;
    nickname: string | null;
    photo: string | null;
    plate: string;
    renavam: string;
    brand: string;
    model: string;
    manufacturingYear: number;
    modelYear: number;
    color: string;
    seatingCapacity: number;
    fuelType: FuelType;
    engineDisplacement: number;
    status: VehicleStatus;
    towing: boolean | null;
    ownerId: number;
    createdAt: string;
    updatedAt: string | null;
    disabledAt: string | null;
}
