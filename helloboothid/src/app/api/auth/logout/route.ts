// src/app/api/auth/logout/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = NextResponse.json({
      status: "success",
      message: "Logout berhasil",
    });

    // Perintah untuk menghapus cookie auth_token
    response.cookies.set("auth_token", "", {
      httpOnly: true,
      expires: new Date(0), // Set kedaluwarsa ke tahun 1970 (Otomatis terhapus)
      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { status: "error", message: "Gagal logout" },
      { status: 500 },
    );
  }
}
