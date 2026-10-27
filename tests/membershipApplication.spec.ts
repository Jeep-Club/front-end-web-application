import { fetchWrapper } from "@/services/fetchWrapper/fetchWrapper";
import { submitMembershipApplicationAction } from "@/actions/membership/submit-application";
import {
    membershipApplicationFormSchema,
    membershipApplicationSubmissionSchema,
} from "@/schemas/membership/application";
import { HttpAPIRoutes } from "@/utils/http/api";

jest.mock("@/services/fetchWrapper/fetchWrapper", () => ({
    __esModule: true,
    fetchWrapper: jest.fn(),
}));

const mockedFetchWrapper = jest.mocked(fetchWrapper);

describe("Public Membership Application (POST /membership-applications)", () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.resetAllMocks();
        process.env = {
            ...originalEnv,
            API_URL: "https://api.jeepclub.test",
            API_FRONTEND_KEY: "frontend-test-key",
        };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    describe("DTO validation & optional email/message (membershipApplicationFormSchema)", () => {
        it("accepts valid payload without email or message (optional fields)", () => {
            const parsed = membershipApplicationFormSchema.safeParse({
                name: "  João da Silva  ",
                cpf: "390.533.447-05",
                phoneNumber: "(11) 98765-4321",
                email: "   ",
                message: "",
            });

            expect(parsed.success).toBe(true);
            if (parsed.success) {
                expect(parsed.data).toEqual({
                    name: "João da Silva",
                    cpf: "390.533.447-05",
                    phoneNumber: "(11) 98765-4321",
                    email: "",
                    message: "",
                });
            }

            const omittedOptional = membershipApplicationFormSchema.safeParse({
                name: "Maria Oliveira",
                cpf: "39053344705",
                phoneNumber: "+55 (12) 99999-8888",
            });
            expect(omittedOptional.success).toBe(true);
        });

        it("enforces name, CPF, phoneNumber, email, and message limits and formats from DTO", () => {
            expect(
                membershipApplicationFormSchema.safeParse({
                    name: "   ",
                    cpf: "39053344705",
                    phoneNumber: "(11) 98765-4321",
                }).success,
            ).toBe(false);

            expect(
                membershipApplicationFormSchema.safeParse({
                    name: "A".repeat(151),
                    cpf: "39053344705",
                    phoneNumber: "(11) 98765-4321",
                }).success,
            ).toBe(false);

            // Invalid CPF format (even if digits are valid CPF)
            expect(
                membershipApplicationFormSchema.safeParse({
                    name: "João da Silva",
                    cpf: "390-533-447-05",
                    phoneNumber: "(11) 98765-4321",
                }).success,
            ).toBe(false);

            // Invalid CPF check digits
            expect(
                membershipApplicationFormSchema.safeParse({
                    name: "João da Silva",
                    cpf: "390.533.447-00",
                    phoneNumber: "(11) 98765-4321",
                }).success,
            ).toBe(false);

            // Invalid phone (landline without leading 9)
            expect(
                membershipApplicationFormSchema.safeParse({
                    name: "João da Silva",
                    cpf: "39053344705",
                    phoneNumber: "(11) 3456-7890",
                }).success,
            ).toBe(false);

            // Invalid email when provided
            expect(
                membershipApplicationFormSchema.safeParse({
                    name: "João da Silva",
                    cpf: "39053344705",
                    phoneNumber: "(11) 98765-4321",
                    email: "email-invalido",
                }).success,
            ).toBe(false);

            // Email exceeding 180 chars
            expect(
                membershipApplicationFormSchema.safeParse({
                    name: "João da Silva",
                    cpf: "39053344705",
                    phoneNumber: "(11) 98765-4321",
                    email: `${"a".repeat(170)}@exemplo.com`,
                }).success,
            ).toBe(false);

            // Message exceeding 2000 chars
            expect(
                membershipApplicationFormSchema.safeParse({
                    name: "João da Silva",
                    cpf: "39053344705",
                    phoneNumber: "(11) 98765-4321",
                    message: "x".repeat(2001),
                }).success,
            ).toBe(false);
        });
    });

    describe("Reduced response { id, status, created } for 201 and 200", () => {
        it("parses only { id, status, created } and does not require personal data", () => {
            const parsed = membershipApplicationSubmissionSchema.safeParse({
                id: 15,
                status: "PENDING",
                created: false,
            });
            expect(parsed).toEqual({
                success: true,
                data: { id: 15, status: "PENDING", created: false },
            });
        });

        it("handles 201 Created (new application, created=true) and sends null when email is omitted", async () => {
            mockedFetchWrapper.mockResolvedValueOnce({
                status: 201,
                data: { id: 101, status: "PENDING", created: true },
            });

            const result = await submitMembershipApplicationAction({
                name: "  João da Silva ",
                cpf: "390.533.447-05",
                phoneNumber: "+55 (11) 98765-4321",
                email: "   ",
                message: "  Quero participar das trilhas. ",
            });

            expect(mockedFetchWrapper).toHaveBeenCalledWith(
                expect.objectContaining({
                    url: `https://api.jeepclub.test/${HttpAPIRoutes.MEMBERSHIP_APPLICATIONS}`,
                    method: "POST",
                    body: JSON.stringify({
                        name: "João da Silva",
                        cpf: "39053344705",
                        phoneNumber: "11987654321",
                        email: null,
                        message: "Quero participar das trilhas.",
                    }),
                }),
            );

            expect(result).toEqual({
                ok: true,
                data: { id: 101, status: "PENDING", created: true },
            });
        });

        it("handles 200 OK (existing PENDING application, created=false) using only { id, status, created }", async () => {
            mockedFetchWrapper.mockResolvedValueOnce({
                status: 200,
                data: { id: 101, status: "PENDING", created: false },
            });

            const result = await submitMembershipApplicationAction({
                name: "Outro Nome Informado",
                cpf: "390.533.447-05",
                phoneNumber: "(11) 91111-2222",
            });

            expect(result).toEqual({
                ok: true,
                data: { id: 101, status: "PENDING", created: false },
            });
            expect(Object.keys((result as { ok: true; data: MembershipApplicationSubmission }).data)).toEqual([
                "id",
                "status",
                "created",
            ]);
        });
    });

    describe("Error handling for blocked CPF, invalid CPF, and existing application", () => {
        it("presents blocked CPF (403 MEMBERSHIP_APPLICATION_NOT_ALLOWED) without implying any update", async () => {
            mockedFetchWrapper.mockRejectedValueOnce({
                status: 403,
                rawData: {
                    code: "MEMBERSHIP_APPLICATION_NOT_ALLOWED",
                    status: 403,
                    detail: "Não é possível realizar uma nova solicitação de associação.",
                },
            });

            const result = await submitMembershipApplicationAction({
                name: "João da Silva",
                cpf: "39053344705",
                phoneNumber: "(11) 98765-4321",
            });

            expect(result).toEqual({
                ok: false,
                message: "Não é possível realizar uma nova solicitação de associação.",
            });
            if (!result.ok) {
                expect(result.message).not.toMatch(/atualizad|alterad/i);
            }
        });

        it("presents invalid CPF (400 VALIDATION_ERROR) without implying any update", async () => {
            mockedFetchWrapper.mockRejectedValueOnce({
                status: 400,
                rawData: {
                    code: "VALIDATION_ERROR",
                    status: 400,
                    detail: "Erro de validação nos campos informados.",
                    errors: [{ field: "cpf", code: "CPF", message: "CPF inválido." }],
                },
            });

            const result = await submitMembershipApplicationAction({
                name: "João da Silva",
                cpf: "39053344700",
                phoneNumber: "(11) 98765-4321",
            });

            expect(result).toEqual({
                ok: false,
                message: "CPF inválido.",
            });
            if (!result.ok) {
                expect(result.message).not.toMatch(/atualizad|alterad/i);
            }
        });

        it("presents existing application/CPF errors (409) without implying the previous request was updated", async () => {
            mockedFetchWrapper.mockRejectedValueOnce({
                status: 409,
                rawData: {
                    code: "MEMBERSHIP_APPLICATION_ALREADY_EXISTS",
                    status: 409,
                    detail: "Já existe uma solicitação para o CPF: 39053344705",
                },
            });

            const existingAppResult = await submitMembershipApplicationAction({
                name: "João da Silva",
                cpf: "39053344705",
                phoneNumber: "(11) 98765-4321",
            });

            expect(existingAppResult).toEqual({
                ok: false,
                message: "Já existe uma solicitação para o CPF: 39053344705",
            });
            if (!existingAppResult.ok) {
                expect(existingAppResult.message).not.toMatch(/atualizad|alterad/i);
            }

            // Even when 409 CONFLICT has an empty detail, it must not use the generic "foram alterados" fallback
            mockedFetchWrapper.mockRejectedValueOnce({
                status: 409,
                rawData: {
                    code: "CONFLICT",
                    status: 409,
                    detail: "",
                },
            });

            const genericConflictResult = await submitMembershipApplicationAction({
                name: "João da Silva",
                cpf: "39053344705",
                phoneNumber: "(11) 98765-4321",
            });

            expect(genericConflictResult.ok).toBe(false);
            if (!genericConflictResult.ok) {
                expect(genericConflictResult.message).toBe(
                    "Já existe uma solicitação ou cadastro para os dados informados.",
                );
                expect(genericConflictResult.message).not.toMatch(/atualizad|alterad/i);
            }
        });
    });
});
