// Espelha o DetailForEditResponseDTO retornado por GET /vehicles/detail-for-edit/member/{vehicleId}.
// So os campos usados pra pre-preencher o formulario de edicao — sem status,
// ownerId ou campos de auditoria (createdAt/updatedAt/disabledAt).
interface VehicleDetailForEdit {
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
    towing: boolean | null;
}
