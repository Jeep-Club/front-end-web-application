import { deflateRawSync, inflateRawSync } from "node:zlib";
import { z } from "zod";
import { permissionModuleSchema } from "@/schemas/auth/permission/permissionModule";
import { sign } from "./sign";
import { verify } from "./verify";

const modulesSchema = permissionModuleSchema.array();
const compressedSchema = z.object({
    encoding: z.literal("deflate-v1"),
    value: z.string(),
});

/** Compress before signing: permissions remain authenticated and HttpOnly. */
export async function signPermissions(permissions: PermissionModule[]): Promise<string> {
    const data = modulesSchema.parse(permissions);
    const value = deflateRawSync(Buffer.from(JSON.stringify(data))).toString("base64url");
    const token = await sign({ encoding: "deflate-v1", value });
    // Leave room for the cookie name and attributes within the browser's 4 KiB limit.
    if (Buffer.byteLength(token, "utf8") > 3800) {
        throw new Error("Permissions exceed the supported cookie size");
    }
    return token;
}

export async function verifyPermissions(token: string): Promise<PermissionModule[]> {
    // Always authenticate before decompressing or trusting permissions.
    const { data } = await verify(token);
    // Accept existing signed cookies during rollout.
    if (Array.isArray(data)) return modulesSchema.parse(data);
    const compressed = compressedSchema.parse(data);
    const json = inflateRawSync(Buffer.from(compressed.value, "base64url"), {
        maxOutputLength: 1024 * 1024,
    }).toString("utf8");
    return modulesSchema.parse(JSON.parse(json));
}
