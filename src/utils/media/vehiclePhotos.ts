type VehiclePhotos = { photo?: string | null; photos?: string[]; images?: { storageKey: string; position: number; primary: boolean }[] };

export function vehiclePhotoKeys(vehicle?: VehiclePhotos): string[] {
    if (vehicle?.images !== undefined) return [...vehicle.images].sort((a, b) => a.position - b.position).map((image) => image.storageKey);
    return [...new Set([vehicle?.photo, ...(vehicle?.photos ?? [])].filter((key): key is string => !!key))];
}

export function appendVehiclePhotos(vehicle: VehiclePhotos | undefined, added: string[]): string[] {
    const photos = [...new Set([...vehiclePhotoKeys(vehicle), ...added])];
    if (photos.length > 5) throw new Error("O veículo pode ter no máximo 5 fotos.");
    return photos;
}
