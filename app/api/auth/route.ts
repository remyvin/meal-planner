// app/api/auth/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { password } = await request.json();

  // Vérifier le mot de passe (à stocker dans les variables d'environnement)
  if (password === process.env.ACCESS_PASSWORD) {
    return NextResponse.json({ success: true });
  }

  return new NextResponse(
    JSON.stringify({ success: false }),
    { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}