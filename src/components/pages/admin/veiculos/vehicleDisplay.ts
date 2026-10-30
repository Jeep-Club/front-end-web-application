export const VEHICLE_STATUS_LABEL: Record<VehicleStatus, string> = {
    ACTIVE: "Ativo",
    INACTIVE: "Inativo",
    ARCHIVED: "Arquivado",
};

export const VEHICLE_STATUS_STYLE: Record<VehicleStatus, string> = {
    ACTIVE: "bg-green-50 text-j-green-600",
    INACTIVE: "bg-red-50 text-red-500",
    ARCHIVED: "bg-gray-100 text-gray-500",
};

export const FUEL_TYPE_LABEL: Record<FuelType, string> = {
    GASOLINE: "Gasolina",
    ETHANOL: "Etanol",
    FLEX: "Flex",
    DIESEL: "Diesel",
    ELECTRIC: "Elétrico",
    HYBRID: "Híbrido",
};

export const FUEL_TYPE_OPTIONS: { value: FuelType; label: string }[] = [
    { value: "GASOLINE", label: "Gasolina" },
    { value: "ETHANOL", label: "Etanol" },
    { value: "FLEX", label: "Flex" },
    { value: "DIESEL", label: "Diesel" },
    { value: "ELECTRIC", label: "Elétrico" },
    { value: "HYBRID", label: "Híbrido" },
];
