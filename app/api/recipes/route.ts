// app/api/recipes/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Récupérer toutes les recettes
export async function GET() {
  try {
    const recipes = await prisma.recipe.findMany({
      include: {
        ingredients: true,
      },
    });
    return NextResponse.json(recipes);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des recettes' },
      { status: 500 }
    );
  }
}

// Créer une nouvelle recette
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const recipe = await prisma.recipe.create({
      data: {
        name: data.name,
        tags: data.tags,
        instructions: data.instructions || [],
        ingredients: {
          create: data.ingredients.map((ing: any) => ({
            name: ing.name,
            quantity: ing.quantity,
            unit: ing.unit,
            category: ing.category,
          })),
        },
      },
      include: {
        ingredients: true,
      },
    });
    return NextResponse.json(recipe);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la création de la recette' },
      { status: 500 }
    );
  }
}