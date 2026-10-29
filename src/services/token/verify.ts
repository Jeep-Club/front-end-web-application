import * as jose from 'jose';
import z from 'zod';
import { getSigningSecret } from './secret';

export async function verify(token: string){
    const secretKey = getSigningSecret();
    const { payload } = await jose.jwtVerify(token, secretKey);
    return payload;
}   

export async function verifyWithSchema<T>(token: string, schema: z.ZodType<T>): Promise<T> {
    const payload = await verify(token);
    return schema.parse(payload.data);
}
