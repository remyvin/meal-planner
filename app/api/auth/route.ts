// app/api/auth/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const correctPassword = process.env.ACCESS_PASSWORD;

    if (password === correctPassword) {
      const response = NextResponse.json({ success: true });
      
      response.cookies.set({
        name: 'auth-token',
        value: 'authenticated',
        httpOnly: true,
        secure: true, // Force HTTPS
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 7 jours
        path: '/',
      });

      return response;
    }

    return NextResponse.json(
      { success: false, message: 'Mot de passe incorrect' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}