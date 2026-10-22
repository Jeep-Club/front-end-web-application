import { createVehicleMultipart, appendVehicleGalleryMultipart } from "@/utils/media/vehicleGallery";
import { vehicleDetailForEditResponseSchema } from "@/schemas/vehicles/detail-for-edit";
import { vehiclePhotoKeys } from "@/utils/media/vehiclePhotos";

const file = () => new File(['image'], 'photo.png', { type: 'image/png' });

it('creates one multipart request with five files and vehicle JSON', async () => {
    const body = createVehicleMultipart({ plate: 'ABC1D23' }, Array.from({ length: 5 }, file));
    expect(body.getAll('photos')).toHaveLength(5);
    expect(JSON.parse(await (body.get('vehicle') as Blob).text())).toEqual({ plate: 'ABC1D23' });
    expect(body.has('photo')).toBe(false);
});

it('retains canonical order and primary while appending uploads with the current revision', async () => {
    const body = appendVehicleGalleryMultipart({ galleryRevision: 7, images: [
        { storageKey: 'second', position: 1, primary: true },
        { storageKey: 'first', position: 0, primary: false },
    ] }, [file(), file(), file()]);
    expect(JSON.parse(await (body.get('gallery') as Blob).text())).toEqual({ expectedRevision: 7, images: [
        { storageKey: 'first', position: 0, primary: false },
        { storageKey: 'second', position: 1, primary: true },
        { uploadIndex: 0, position: 2, primary: false },
        { uploadIndex: 1, position: 3, primary: false },
        { uploadIndex: 2, position: 4, primary: false },
    ] });
    expect(body.getAll('photos')).toHaveLength(3);
});

it('makes the first upload primary for an empty gallery', async () => {
    const body = appendVehicleGalleryMultipart({ galleryRevision: 0, images: [] }, [file()]);
    expect(JSON.parse(await (body.get('gallery') as Blob).text()).images).toEqual([{ uploadIndex: 0, position: 0, primary: true }]);
});

it('rejects six photos, missing revision, unsupported types and oversized files', () => {
    expect(() => createVehicleMultipart({}, Array.from({ length: 6 }, file))).toThrow('5 fotos');
    expect(() => appendVehicleGalleryMultipart({ galleryRevision: 1, photo: 'cover' }, Array.from({ length: 5 }, file))).toThrow('5 fotos');
    expect(() => appendVehicleGalleryMultipart({}, [file()])).toThrow();
    expect(() => createVehicleMultipart({}, [new File(['x'], 'bad.txt', { type: 'text/plain' })])).toThrow();
    expect(() => createVehicleMultipart({}, [new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'big.png', { type: 'image/png' })])).toThrow();
});

it('reads images and revision from backend details instead of dropping gallery fields', () => {
    const parsed = vehicleDetailForEditResponseSchema.parse({ id: 1, nickname: null, photo: 'cover',
        images: [{ storageKey: 'other', position: 1, primary: false }, { storageKey: 'cover', position: 0, primary: true }], galleryRevision: 3,
        plate: 'ABC1D23', renavam: '12345678901', brand: 'Jeep', model: 'Jeep', manufacturingYear: 2020, modelYear: 2020,
        color: 'Preto', seatingCapacity: 5, fuelType: 'GASOLINE', engineDisplacement: 2, towing: false });
    expect(parsed.galleryRevision).toBe(3);
    expect(parsed.photos).toEqual(['cover', 'other']);
    expect(vehiclePhotoKeys(parsed)).toEqual(['cover', 'other']);
});
