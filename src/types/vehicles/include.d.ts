type FuelType =
    | 'GASOLINE'
    | 'ETHANOL'
    | 'FLEX'
    | 'DIESEL'
    | 'ELECTRIC'
    | 'HYBRID';

type VehicleStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING';

interface IncludeVehicleMemberRequest {
    nickname?: string;
    photo?: string;
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

type IncludeVehicleMemberFormData = Omit<IncludeVehicleMemberRequest, 'photo'> & {
    photo?: File[];
};
