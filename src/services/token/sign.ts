import * as jose from 'jose';

export async function sign(data: object, expiration?: string): Promise<string> {
    const access = process.env.ACCESS;
    if (!access) {
        throw new Error('ACCESS is not defined in environment variables');
    }
    
    const secretKey = new TextEncoder().encode(access);
    return await new jose.SignJWT({data}).setProtectedHeader({ alg: 'HS256' }).setExpirationTime(expiration??'7d').sign(secretKey);
}   