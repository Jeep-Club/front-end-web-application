type VehiclePhotos = { photo?: string | null; photos?: string[] };

export function vehiclePhotoKeys(vehicle?: VehiclePhotos): string[] {
    return [...new Set([vehicle?.photo, ...(vehicle?.photos ?? [])].filter((key): key is string => !!key))];
}

export function appendVehiclePhotos(vehicle: VehiclePhotos | undefined, added: string[]): string[] {
    const photos = [...new Set([...vehiclePhotoKeys(vehicle), ...added])];
    if (photos.length > 3) throw new Error("O veículo pode ter no máximo 3 fotos.");
    return photos;
}
