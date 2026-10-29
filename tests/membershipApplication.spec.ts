import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { submitMembershipApplicationAction } from "@/server/actions/membership/submit-application";
import {
    membershipApplicationFormSchema,
    membershipApplicationSubmissionSchema,
} from "@/schemas/membership/application";
import { HttpAPIRoutes } from "@/utils/http/api";

jest.mock("@/services/fetchWrapper/actionFetchWrapper", () => ({
    __esModule: true,
    default: jest.fn(),
}));

const mockedFetchWrapper = jest.mocked(actionFetchWrapper);

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

    describe("submission through the action HTTP boundary", () => {
        it("normalizes optional values and Brazilian phone numbers", async () => {
            mockedFetchWrapper.mockResolvedValueOnce({ status: 201, data: { id: 101, status: "PENDING", created: true } });
            const result = await submitMembershipApplicationAction({ name: "  Jo?o da Silva  ", cpf: "390.533.447-05", phoneNumber: "+55 (11) 98765-4321" });
            expect(result).toEqual({ id: 101, status: "PENDING", created: true });
            expect(mockedFetchWrapper).toHaveBeenCalledWith(expect.objectContaining({
                url: HttpAPIRoutes.MEMBERSHIP_APPLICATIONS,
                body: JSON.stringify({ name: "Jo?o da Silva", cpf: "39053344705", phoneNumber: "11987654321", email: null, message: null }),
            }));
        });
        it("returns an existing pending application directly", async () => {
            const data = { id: 101, status: "PENDING" as const, created: false };
            mockedFetchWrapper.mockResolvedValueOnce({ status: 200, data });
            await expect(submitMembershipApplicationAction({ name: "Jo?o", cpf: "39053344705", phoneNumber: "11987654321" })).resolves.toEqual(data);
            expect(membershipApplicationSubmissionSchema.safeParse(data).success).toBe(true);
        });
        it("preserves the normalized error from the HTTP boundary", async () => {
            const error = new Error("CPF inv?lido.");
            mockedFetchWrapper.mockRejectedValueOnce(error);
            await expect(submitMembershipApplicationAction({ name: "Jo?o", cpf: "39053344700", phoneNumber: "11987654321" })).rejects.toBe(error);
        });
    });
});
