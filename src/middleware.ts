import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;
    console.log(path)
    if (path === '/') {
        return NextResponse.redirect(new URL('/busline', request.url));
    }
}
