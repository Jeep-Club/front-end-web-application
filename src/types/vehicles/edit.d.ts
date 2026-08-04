// Espelha o EditRequestDTO do backend (PUT /vehicles/edit/member/{vehicleId}).
interface EditVehicleMemberRequest {
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

type EditVehicleMemberFormData = Omit<EditVehicleMemberRequest, 'photo'> & {
    photo?: File[];
};
