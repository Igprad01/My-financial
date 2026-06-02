import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import { SignJWT } from "jose";


const SECRET_KEY = process.env.JWT_SECRET || "rahasia-keuangan-app-super-aman-2024";
const key = new TextEncoder().encode(SECRET_KEY);

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Cari user di database
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verifikasi password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      role: 'user',
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d") 
      .sign(key);

    const cookieStore = await cookies();
    cookieStore.set("auth_token", token, {
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production" && (req.headers.get("x-forwarded-proto") === "https" || req.url.startsWith("https://")),
      sameSite: "lax", 
      path: "/",
      maxAge: 60 * 60 * 24 * 7, 
    });

    return NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
