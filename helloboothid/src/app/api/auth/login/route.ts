// src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { query } from "../../../../lib/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-anda";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // 1. UPDATE: Tambahkan sub_role di dalam SELECT database
    const result = await query(
      `SELECT id, username, password, role, sub_role FROM users WHERE username = $1`,
      [username],
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          status: "error",
          message: "Username atau Password yang Dimasukkan salah!",
        },
        { status: 401 },
      );
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json(
        { status: "error", message: "Kredensial tidak valid!" },
        { status: 401 },
      );
    }

    // 2. UPDATE KUNCI: Titipkan sub_role ke dalam payload JWT Token
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        sub_role: user.sub_role, // <--- INI YANG MEMBUAT DASBOR BISA MEMBEDAKAN B2B/B2C/MANAGER
      },
      JWT_SECRET,
      { expiresIn: "1d" },
    );

    const response = NextResponse.json({
      status: "success",
      data: { role: user.role, sub_role: user.sub_role },
    });

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 86400,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { status: "error", message: "Server Error" },
      { status: 500 },
    );
  }
}
