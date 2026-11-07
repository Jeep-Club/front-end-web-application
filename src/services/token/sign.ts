import * as jose from 'jose';
import { getSigningSecret } from './secret';

export async function sign(data: object, expiration?: string): Promise<string> {
    const secretKey = getSigningSecret();
    return await new jose.SignJWT({data}).setProtectedHeader({ alg: 'HS256' }).setExpirationTime(expiration??'7d').sign(secretKey);
}   
