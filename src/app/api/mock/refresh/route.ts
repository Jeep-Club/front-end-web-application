import { NextRequest, NextResponse } from "next/server";


export async function POST(request: NextRequest) {
    // const accessRequest = request.headers.get("Access");

    // if (accessRequest !== process.env.ACCESS) {
    //     return NextResponse.json({ message: 'Invalid Access' }, { status: 403 });
    // }

    const { refreshToken }: RefreshTokenRequest = await request.json();

    if (refreshToken ) {
        return NextResponse.json(
            {
                status: "SUCCESS",
                refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh_token_mock",
                accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.access_token_mock",
                expiresInSeconds: 3600
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