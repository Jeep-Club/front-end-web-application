jest.mock("@/services/token/sign", () => ({ sign: jest.fn() }));
jest.mock("@/services/token/verify", () => ({ verify: jest.fn() }));
import { randomBytes } from "node:crypto";
import { signPermissions, verifyPermissions } from "@/services/token/permissions";
import { sign } from "@/services/token/sign";
import { verify } from "@/services/token/verify";

const permissions: PermissionModule[] = Array.from({ length: 33 }, (_, i) => ({
    module: `APPLICATION_MODULE${i}`,
    actions: ["CREATE", "READ", "UPDATE", "DELETE", "MANAGE_PUBLICATIONS"],
}));

beforeEach(() => {
    jest.resetAllMocks();
    jest.mocked(sign).mockImplementation(async data => {
        const token = Buffer.from(JSON.stringify({ data })).toString("base64url");
        jest.mocked(verify).mockResolvedValue({ data });
        return token;
    });
});

it("preserves all 165 permissions in a compact cookie", async () => {
    const oldToken = Buffer.from(JSON.stringify({ data: permissions })).toString("base64url");
    const token = await signPermissions(permissions);
    expect(oldToken.length).toBeGreaterThan(4096);
    expect(token.length + 200).toBeLessThan(4096);
    expect(token.length).toBeLessThan(oldToken.length / 2);
    await expect(verifyPermissions(token)).resolves.toEqual(permissions);
});

it("accepts existing signed permission arrays", async () => {
    jest.mocked(verify).mockResolvedValue({ data: permissions });
    await expect(verifyPermissions("legacy")).resolves.toEqual(permissions);
});

it("rejects tokens when signature verification fails", async () => {
    jest.mocked(verify).mockRejectedValue(new Error("Invalid signature"));
    await expect(verifyPermissions("tampered")).rejects.toThrow("Invalid signature");
});

it("rejects malformed compressed payloads", async () => {
    jest.mocked(verify).mockResolvedValue({ data: { encoding: "deflate-v1", value: "invalid" } });
    await expect(verifyPermissions("invalid")).rejects.toThrow();
});

it("supports users without permissions", async () => {
    const token = await signPermissions([]);
    await expect(verifyPermissions(token)).resolves.toEqual([]);
});

it("fails explicitly before writing a cookie that the browser would discard", async () => {
    await expect(signPermissions([{
        module: "LARGE",
        actions: Array.from({ length: 165 }, () => randomBytes(80).toString("hex")),
    }])).rejects.toThrow("cookie size");
});
