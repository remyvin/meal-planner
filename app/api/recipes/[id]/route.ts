// app/api/recipes/[id]/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const body = await request.json()

    // Supprimer les anciens ingrédients
    await prisma.ingredient.deleteMany({
      where: { recipeId: id },
    })

    // Mettre à jour la recette avec les nouveaux ingrédients
    const recipe = await prisma.recipe.update({
      where: { id },
      data: {
        name: body.name,
        tags: body.tags,
        instructions: body.instructions,
        ingredients: {
          create: body.ingredients.map((ing: any) => ({
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
    })

    return NextResponse.json(recipe)
  } catch (error) {
    console.error('Error updating recipe:', error)
    return NextResponse.json(
      { error: 'Error updating recipe' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)

    // Supprimer d'abord les ingrédients
    await prisma.ingredient.deleteMany({
      where: { recipeId: id },
    })

    // Ensuite supprimer la recette
    await prisma.recipe.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting recipe:', error)
    return NextResponse.json(
      { error: 'Error deleting recipe' },
      { status: 500 }
    )
  }
}