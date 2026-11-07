type FuelType =
    | 'GASOLINE'
    | 'ETHANOL'
    | 'FLEX'
    | 'DIESEL'
    | 'ELECTRIC'
    | 'HYBRID';

type VehicleStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

interface IncludeVehicleMemberRequest {
    nickname?: string;
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
    towing: boolean;
}

type IncludeVehicleMemberFormData = Omit<IncludeVehicleMemberRequest, 'photo' | 'photos'> & {
    photo?: File[];
};
