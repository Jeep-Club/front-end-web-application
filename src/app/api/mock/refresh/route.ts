import { NextRequest, NextResponse } from "next/server";


export async function POST(request: NextRequest) {
    // const accessRequest = request.headers.get("Access");

    // if (accessRequest !== process.env.ACCESS) {
    //     return NextResponse.json({ message: 'Invalid Access' }, { status: 403 });
    // }

    const { AuthAccessToken, AuthRefreshToken }: RefreshTokenRequest = await request.json();

    if (AuthAccessToken === 'auth-access-token-123456789' && AuthRefreshToken === 'auth-refresh-token-123456789') {
        return NextResponse.json(
            {
                AuthAccessToken: 'auth-access-token-12345678910',
                AuthRefreshToken: 'auth-refresh-token-123456789',
                AccessTokenExpiration: '2033-04-19T00:47:34-03:00'
            }
            ,
            {
                status: 201
            }
        );
    }

    return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
}

export async function GET(request: NextRequest) {
    const params = request.headers.get("Authorization");
    if (!params) {
        return NextResponse.json({ message: 'No token provided' }, { status: 401 });
    }
    if(params === 'auth-access-token-12345678910') {
        return NextResponse.json({ message: 'Need Refresh Token' }, { status: 403 });
    }

    return NextResponse.json({ message: 'good refresh' }, { status: 200 });
}