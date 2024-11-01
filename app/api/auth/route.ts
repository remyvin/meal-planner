// app/api/auth/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const correctPassword = process.env.ACCESS_PASSWORD || 'votre-mot-de-passe';

    if (password === correctPassword) {
      // Créer la réponse
      const response = NextResponse.json({ 
        success: true,
        message: 'Authentification réussie'
      });

      // Définir le cookie avec des options plus permissives
      response.cookies.set({
        name: 'auth-token',
        value: 'authenticated',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
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
    console.error('Erreur d\'authentification:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}