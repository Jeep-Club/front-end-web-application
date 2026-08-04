type VehicleStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING';

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
    status: VehicleStatus;
    towing: boolean | null;
    ownerId: number;
    createdAt: string;
    updatedAt: string | null;
    disabledAt: string | null;
}
