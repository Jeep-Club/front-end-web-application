import { appendVehiclePhotos, vehiclePhotoKeys } from '@/utils/media/vehiclePhotos';

it('adds two photos to the existing cover without replacing it', () => {
    expect(appendVehiclePhotos({ photo: 'cover', photos: ['cover'] }, ['second', 'third'])).toEqual(['cover', 'second', 'third']);
});

it('keeps an existing gallery and rejects more than five photos', () => {
    const vehicle = { photo: 'cover', photos: ['cover', 'second'] };
    expect(appendVehiclePhotos(vehicle, ['third'])).toEqual(['cover', 'second', 'third']);
    expect(() => appendVehiclePhotos(vehicle, ['third', 'fourth', 'fifth', 'sixth'])).toThrow('máximo 5');
});

it('supports legacy vehicles with only a cover and creation without photos', () => {
    expect(vehiclePhotoKeys({ photo: 'cover' })).toEqual(['cover']);
    expect(appendVehiclePhotos(undefined, [])).toEqual([]);
});
