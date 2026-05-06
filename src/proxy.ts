import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest){
    const authenticatedPaths = ["/home"];
    const authenticationPaths = ["/login", "/register"];

    const path = request.nextUrl.pathname;
    
    if(request.cookies.has("AuthAccessToken") && authenticationPaths.includes(path)){
        return NextResponse.redirect(new URL('/home', request.url));
    }

    if(!request.cookies.has("AuthAccessToken") && authenticatedPaths.includes(path)){ 
        return NextResponse.redirect(new URL('/', request.url));
    }


    return NextResponse.next();
}
