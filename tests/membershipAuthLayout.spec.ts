import AuthLayout from "@/app/(auth)/layout";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getMembershipAccess } from "@/server/membershipAccess";
import { haveRoutePermissions } from "@/utils/permission/routePermissions";

jest.mock("next/headers", () => ({
    cookies: jest.fn(async () => ({ get: () => ({ value: "test-permissions" }) })),
    headers: jest.fn(),
}));
jest.mock("next/navigation", () => ({
    redirect: jest.fn((path: string) => { throw new Error(`REDIRECT:${path}`); }),
    notFound: jest.fn(() => { throw new Error("NOT_FOUND"); }),
}));
jest.mock("@/server/membershipAccess", () => ({ getMembershipAccess: jest.fn() }));
jest.mock("@/providers/auth/UserProvider", () => ({ __esModule: true, default: () => null }));
jest.mock("@/services/token/permissions", () => ({ verifyPermissions: jest.fn(async () => []) }));
jest.mock("@/utils/auth/get", () => ({ getAuthCookies: { SERVER: jest.fn(async () => ({ AuthAccessToken: "test-access", AuthRefreshToken: "test-refresh" })) } }));
jest.mock("@/utils/permission/routePermissions", () => ({ haveRoutePermissions: jest.fn(async () => true) }));
jest.mock("@/config/adminModules", () => ({ hasAnyAdminAccess: jest.fn(() => true) }));

beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(headers).mockResolvedValue(new Headers({ "x-route-pathname": "/feed" }));
});

it.each(["payment-required", "unavailable"] as const)("redirects direct access before route permissions when %s", async (access) => {
    jest.mocked(getMembershipAccess).mockResolvedValue(access);
    await expect(AuthLayout({ children: null })).rejects.toThrow("REDIRECT:/financeiro");
    expect(haveRoutePermissions).not.toHaveBeenCalled();
});

it("preserves direct access to payment history when payment is required", async () => {
    jest.mocked(headers).mockResolvedValue(new Headers({ "x-route-pathname": "/financeiro" }));
    jest.mocked(getMembershipAccess).mockResolvedValue("payment-required");
    await expect(AuthLayout({ children: null })).resolves.toBeDefined();
    expect(redirect).not.toHaveBeenCalled();
});

it("continues checking route permissions for a financially regular user", async () => {
    jest.mocked(getMembershipAccess).mockResolvedValue("allowed");
    await expect(AuthLayout({ children: null })).resolves.toBeDefined();
    expect(haveRoutePermissions).toHaveBeenCalledWith(expect.objectContaining({ pathname: "/feed" }));
});
