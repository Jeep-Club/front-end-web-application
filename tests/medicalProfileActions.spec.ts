import actionFetchWrapper from '@/services/fetchWrapper/actionFetchWrapper';
import {
    getMedicalProfileAction,
    saveMedicalProfileAction,
} from '@/actions/profile/medical-profile';
import { medicalProfileResponseSchema } from '@/schemas/profile/medical-profile';
import { HttpAPIRoutes } from '@/utils/http/api';

jest.mock('@/services/fetchWrapper/actionFetchWrapper', () => ({
    __esModule: true,
    default: jest.fn(),
}));

const mockedActionFetchWrapper = jest.mocked(actionFetchWrapper);

const medicalProfile: MedicalProfile = {
    id: 1,
    ownerType: 'USER',
    ownerId: 10,
    bloodType: 'O_POSITIVE',
    allergies: 'Dipirona',
    chronicConditions: null,
    continuousMedications: null,
    healthInsuranceProvider: 'Unimed',
    healthInsurancePlan: 'Nacional',
    healthInsuranceNumber: '123456789',
    emergencyContactName: 'Maria da Silva',
    emergencyContactPhone: '(12) 99999-9999',
    emergencyContactRelationship: 'Mãe',
    observations: null,
    createdAt: '2026-08-08T12:00:00Z',
    updatedAt: '2026-08-08T12:00:00Z',
};

const formData: MedicalProfileRequest = {
    bloodType: 'O_POSITIVE',
    allergies: 'Dipirona',
    chronicConditions: '',
    continuousMedications: '',
    healthInsuranceProvider: 'Unimed',
    healthInsurancePlan: 'Nacional',
    healthInsuranceNumber: '123456789',
    emergencyContactName: 'Maria da Silva',
    emergencyContactPhone: '(12) 99999-9999',
    emergencyContactRelationship: 'Mãe',
    observations: '',
};

describe('ações do perfil médico', () => {
    beforeEach(() => {
        mockedActionFetchWrapper.mockReset();
    });

    it('consulta o perfil atual no endpoint do usuário autenticado', async () => {
        mockedActionFetchWrapper.mockResolvedValue({ status: 200, data: medicalProfile });

        await expect(getMedicalProfileAction()).resolves.toEqual(medicalProfile);
        expect(mockedActionFetchWrapper).toHaveBeenCalledWith({
            url: HttpAPIRoutes.MEDICAL_PROFILE_MEMBER,
            method: 'GET',
            schema: medicalProfileResponseSchema,
        });
    });

    it('retorna null quando o usuário ainda não possui perfil médico', async () => {
        mockedActionFetchWrapper.mockRejectedValue({ status: 404, rawData: {} });

        await expect(getMedicalProfileAction()).resolves.toBeNull();
    });

    it('envia os dados do formulário por PUT e retorna o perfil atualizado', async () => {
        mockedActionFetchWrapper.mockResolvedValue({ status: 200, data: medicalProfile });

        await expect(saveMedicalProfileAction(formData)).resolves.toEqual(medicalProfile);
        expect(mockedActionFetchWrapper).toHaveBeenCalledTimes(1);
        expect(mockedActionFetchWrapper).toHaveBeenCalledWith({
            url: HttpAPIRoutes.MEDICAL_PROFILE_MEMBER,
            method: 'PUT',
            schema: medicalProfileResponseSchema,
            body: JSON.stringify(formData),
        });
    });

    it('apresenta a mensagem de validação retornada pela API ao salvar', async () => {
        mockedActionFetchWrapper.mockRejectedValue({
            status: 400,
            rawData: {
                errors: [{ field: 'allergies', message: 'As alergias devem ter no máximo 2000 caracteres.' }],
            },
        });

        await expect(saveMedicalProfileAction(formData)).rejects.toThrow(
            'As alergias devem ter no máximo 2000 caracteres.',
        );
    });

    it('usa mensagem genérica quando a API não retorna um erro reconhecido', async () => {
        mockedActionFetchWrapper.mockRejectedValue(new Error('network error'));

        await expect(saveMedicalProfileAction(formData)).rejects.toThrow(
            'Erro ao salvar o perfil médico',
        );
    });
});
