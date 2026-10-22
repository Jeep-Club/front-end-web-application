import { vehiclePhotoKeys } from "./vehiclePhotos";

type GalleryVehicle = { photo?: string | null; photos?: string[]; images?: { storageKey: string; position: number; primary: boolean }[]; galleryRevision?: number };

function appendFiles(body: FormData, files: File[]) {
    if (files.length > 5) throw new Error("Envie no máximo 5 fotos.");
    for (const file of files) {
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size === 0 || file.size > 5 * 1024 * 1024) {
            throw new Error("Use imagens JPEG, PNG ou WebP de até 5 MiB.");
        }
        body.append('photos', file);
    }
}

export function createVehicleMultipart(vehicle: object, files: File[]): FormData {
    const body = new FormData();
    body.append('vehicle', new Blob([JSON.stringify(vehicle)], { type: 'application/json' }));
    appendFiles(body, files);
    return body;
}

export function appendVehicleGalleryMultipart(vehicle: GalleryVehicle | undefined, files: File[]): FormData {
    if (!vehicle || vehicle.galleryRevision === undefined) throw new Error("Reabra o veículo para carregar a revisão da galeria.");
    const retained = vehicle.images !== undefined
        ? [...vehicle.images].sort((a, b) => a.position - b.position)
        : vehiclePhotoKeys(vehicle).map((storageKey, position) => ({ storageKey, position, primary: position === 0 }));
    if (retained.length + files.length > 5) throw new Error("O veículo pode ter no máximo 5 fotos.");
    const images = [
        ...retained.map(({ storageKey, primary }, position) => ({ storageKey, primary, position })),
        ...files.map((_, uploadIndex) => ({ uploadIndex, position: retained.length + uploadIndex, primary: retained.length === 0 && uploadIndex === 0 })),
    ];
    const body = new FormData();
    body.append('gallery', new Blob([JSON.stringify({ expectedRevision: vehicle.galleryRevision, images })], { type: 'application/json' }));
    appendFiles(body, files);
    return body;
}
