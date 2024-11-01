// app/api/weekly-plan/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Récupérer le planning
export async function GET() {
  try {
    const weeklyPlan = await prisma.weeklyPlan.findMany({
      include: {
        midi: {
          include: {
            ingredients: true,
          },
        },
        soir: {
          include: {
            ingredients: true,
          },
        },
      },
    });
    return NextResponse.json(weeklyPlan);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du planning' },
      { status: 500 }
    );
  }
}

// Mettre à jour le planning
export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { day, midiId, soirId } = data;

    const updatedPlan = await prisma.weeklyPlan.upsert({
      where: { day: day },
      create: {
        day,
        midiId,
        soirId,
      },
      update: {
        midiId,
        soirId,
      },
      include: {
        midi: {
          include: {
            ingredients: true,
          },
        },
        soir: {
          include: {
            ingredients: true,
          },
        },
      },
    });

    return NextResponse.json(updatedPlan);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du planning' },
      { status: 500 }
    );
  }
}