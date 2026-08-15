// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "super-secret-key-anda",
);

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const { pathname } = request.nextUrl;

  // 1. Jika TIDAK ADA token dan mencoba akses halaman yang diproteksi
  if (!token) {
    if (
      pathname.startsWith("/admin") ||
      pathname.startsWith("/freelancer") ||
      pathname.startsWith("/owner") // Tambahan untuk Owner
    ) {
      return NextResponse.redirect(new URL("/", request.url)); // Lempar ke halaman akar (Login)
    }
  }

  try {
    if (token) {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      const role = payload.role as string;

      // 2. Proteksi Akses Berdasarkan Role
      if (pathname.startsWith("/admin") && role !== "admin") {
        return NextResponse.redirect(new URL("/", request.url));
      }
      if (
        pathname.startsWith("/freelancer") &&
        role !== "freelancer" &&
        role !== "crew"
      ) {
        return NextResponse.redirect(new URL("/", request.url));
      }
      // Tambahan proteksi ketat untuk rute Owner
      if (pathname.startsWith("/owner") && role !== "owner") {
        return NextResponse.redirect(new URL("/", request.url));
      }

      // 3. Jika SUDAH login dan mencoba akses halaman akar (Login), langsung lempar ke Dashboard masing-masing
      if (pathname === "/") {
        let path = "/";
        if (role === "admin") path = "/admin";
        else if (role === "freelancer" || role === "crew") path = "/freelancer";
        else if (role === "owner") path = "/owner"; // Tambahan redirect untuk Owner

        if (path !== "/") {
          return NextResponse.redirect(new URL(path, request.url));
        }
      }
    }
  } catch (error) {
    // Jika token error/expired, hapus cookie dan biarkan user di halaman login
    if (pathname !== "/") {
      const response = NextResponse.redirect(new URL("/", request.url));
      response.cookies.delete("auth_token");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  // Sertakan '/owner/:path*' ke dalam matcher agar middleware membaca rute tersebut
  matcher: ["/admin/:path*", "/freelancer/:path*", "/owner/:path*", "/"],
};
