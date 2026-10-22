import actionFetchWrapper from '@/services/fetchWrapper/actionFetchWrapper';
import { includeVehicleMemberAction } from '@/actions/vehicles/include-member';
import { includeVehicleAdminAction } from '@/actions/admin/vehicles/include';
import { editVehicleMemberAction } from '@/actions/vehicles/edit-member';
import { editVehicleAdminAction } from '@/actions/admin/vehicles/edit';
import { createVehicleMultipart, appendVehicleGalleryMultipart } from '@/utils/media/vehicleGallery';

jest.mock('@/services/fetchWrapper/actionFetchWrapper', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('next/navigation', () => ({ unstable_rethrow: jest.fn() }));
beforeEach(() => jest.resetAllMocks());

it.each(['member', 'admin'])('sends vehicle creation as multipart for %s', async (scope) => {
    jest.mocked(actionFetchWrapper).mockResolvedValue({ status: 201, data: '' });
    const body = createVehicleMultipart({ plate: 'ABC1D23' }, [new File(['x'], 'a.png', { type: 'image/png' })]);
    if (scope === 'member') await includeVehicleMemberAction(body);
    else await includeVehicleAdminAction(12, body);
    expect(actionFetchWrapper).toHaveBeenCalledTimes(1);
    expect(actionFetchWrapper).toHaveBeenCalledWith(expect.objectContaining({
        url: scope === 'member' ? 'vehicles/include/member' : 'vehicles/include/admin/12', method: 'POST', body,
    }));
});

it.each(['member', 'admin'])('keeps metadata and gallery in their dedicated routes for %s', async (scope) => {
    jest.mocked(actionFetchWrapper).mockResolvedValue({ status: 200, data: '' });
    const gallery = appendVehicleGalleryMultipart({ galleryRevision: 2, images: [] }, [new File(['x'], 'a.png', { type: 'image/png' })]);
    const save = scope === 'member' ? editVehicleMemberAction : editVehicleAdminAction;
    await save(7, { nickname: 'Jeep' }, gallery);
    expect(actionFetchWrapper).toHaveBeenNthCalledWith(1, expect.objectContaining({ url: `vehicles/edit/${scope}/7`, body: JSON.stringify({ nickname: 'Jeep' }) }));
    expect(actionFetchWrapper).toHaveBeenNthCalledWith(2, expect.objectContaining({ url: `vehicles/gallery/${scope}/7`, method: 'PUT', body: gallery }));
});

it('does not overwrite the gallery when only metadata changes', async () => {
    jest.mocked(actionFetchWrapper).mockResolvedValue({ status: 200, data: '' });
    await editVehicleMemberAction(7, { nickname: 'New name' });
    expect(actionFetchWrapper).toHaveBeenCalledTimes(1);
});

it('surfaces revision conflicts without retrying an overwrite', async () => {
    jest.mocked(actionFetchWrapper).mockResolvedValueOnce({ status: 200, data: '' }).mockRejectedValueOnce({ status: 409, rawData: { status: 409, code: 'VEHICLE_GALLERY_CONFLICT', detail: 'Galeria alterada. Recarregue o veiculo.' } });
    const gallery = appendVehicleGalleryMultipart({ galleryRevision: 2, images: [] }, []);
    await expect(editVehicleMemberAction(7, {}, gallery)).rejects.toThrow('Galeria alterada');
    expect(actionFetchWrapper).toHaveBeenCalledTimes(2);
});
