import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  const isLoginPage = req.nextUrl.pathname.startsWith("/login");
  const isAdminPage = req.nextUrl.pathname.startsWith("/admin");

  let isAuth = false;
  let role = null;

  if (token) {
    try {
      // Decode JWT (do not verify signature here, just decode)
      const decoded: any = jwt.decode(token);
      if (decoded) {
        isAuth = true;
        role = decoded.role;
      }
    } catch (e) {
      isAuth = false;
    }
  }

  // Not authenticated and not on login page: redirect to login
  if (!isAuth && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Authenticated and on login page: redirect to home
  if (isAuth && isLoginPage) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // If trying to access /admin but not , redirect to /upload
  if (isAdminPage && role !== "super_admin") {
    return NextResponse.redirect(new URL("/upload", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};