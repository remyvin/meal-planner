import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid ID format' },
        { status: 400 }
      )
    }

    const body = await request.json()

    // Utilisation de transaction pour éviter les états inconsistants
    const recipe = await prisma.$transaction(async (tx) => {
      // Supprimer les anciens ingrédients
      await tx.ingredient.deleteMany({
        where: { recipeId: id },
      })

      // Mettre à jour la recette
      return tx.recipe.update({
        where: { id },
        data: {
          name: body.name,
          tags: body.tags,
          instructions: body.instructions,
          ingredients: {
            create: body.ingredients,
          },
        },
        include: {
          ingredients: true,
        },
      })
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
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid ID format' },
        { status: 400 }
      )
    }

    // Utilisation de transaction
    await prisma.$transaction(async (tx) => {
      await tx.ingredient.deleteMany({
        where: { recipeId: id },
      })
      await tx.recipe.delete({
        where: { id },
      })
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