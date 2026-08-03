type FuelType =
    | 'GASOLINE'
    | 'ETHANOL'
    | 'FLEX'
    | 'DIESEL'
    | 'ELECTRIC'
    | 'HYBRID';

// TODO: depois precisamos tirar esse ownerId daqui
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
    ownerId: number;
}

type IncludeVehicleMemberFormData = Omit<IncludeVehicleMemberRequest, 'ownerId'>;
