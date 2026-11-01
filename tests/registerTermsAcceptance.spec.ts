import { registerAction } from "@/actions/auth/registerAction";
import type { RegisterSubmission } from "@/schemas/auth/register/registerRequest";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { login } from "@/utils/auth/login";

jest.mock("@/services/fetchWrapper/actionFetchWrapper", () => ({
    __esModule: true,
    default: jest.fn(),
}));
jest.mock("@/utils/auth/login", () => ({ login: jest.fn() }));

const fetchMock = jest.mocked(actionFetchWrapper);
const loginMock = jest.mocked(login);

const registration: RegisterRequest = {
    name: "Pessoa de Teste",
    birthData: "1990-05-15",
    email: "cadastro@example.com",
    cpf: "52998224725",
    password: "Cadastro123!",
    phoneNumber: "12999999999",
};

describe("aceite obrigatório dos termos no cadastro", () => {
    beforeEach(() => jest.resetAllMocks());

    it.each([false, undefined, "true"])("recusa aceite inválido (%s) antes de criar a conta", async (termsAccepted) => {
        const submission = { ...registration, termsAccepted } as unknown as RegisterSubmission;

        await expect(registerAction(submission)).rejects.toThrow("Você precisa aceitar os Termos de Uso");

        expect(fetchMock).not.toHaveBeenCalled();
        expect(loginMock).not.toHaveBeenCalled();
    });

    it("permite cadastro com aceite explícito sem alterar o contrato da API", async () => {
        const tokens: RegisterResponse = {
            accessToken: "test-access-token",
            refreshToken: "test-refresh-token",
            expiresInSeconds: 3600,
        };
        fetchMock.mockResolvedValue({ status: 201, data: tokens });
        loginMock.mockResolvedValue(undefined);

        await expect(registerAction({ ...registration, termsAccepted: true })).resolves.toEqual(tokens);

        expect(fetchMock).toHaveBeenCalledTimes(1);
        const request = fetchMock.mock.calls[0][0];
        expect(request.method).toBe("POST");
        expect(JSON.parse(request.body as string)).toEqual(registration);
        expect(loginMock).toHaveBeenCalledWith(tokens.accessToken, tokens.refreshToken, expect.any(String));
    });
});
