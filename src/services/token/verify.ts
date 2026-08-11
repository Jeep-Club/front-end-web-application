import * as jose from 'jose';
import z from 'zod';

export async function verify(token: string){
    const access = process.env.ACCESS || "secret-key-jeep-clube-dev-token";
    if (!access) {
        throw new Error('ACCESS is not defined in environment variables');
    }   

    const secretKey = new TextEncoder().encode(access);
    const { payload } = await jose.jwtVerify(token, secretKey);
    return payload;
}   

export async function verifyWithSchema<T>(token: string, schema: z.ZodType<T>): Promise<T> {
    const payload = await verify(token);
    return schema.parse(payload.data);
}