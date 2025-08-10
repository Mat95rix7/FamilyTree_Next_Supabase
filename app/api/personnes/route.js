import { NextResponse } from 'next/server';
import { getAllPersonnes, createPersonne } from '@/app/services/personnesService';

export async function GET() {
  try {
    const personnes = await getAllPersonnes();
    return NextResponse.json(personnes);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    // Récupérer les données du formulaire
    const formData = await request.formData();
    
    // Passer directement le FormData à votre service
    const personne = await createPersonne(formData);

    return NextResponse.json(personne, { status: 201 });
  } catch (error) {
    console.error('Erreur dans POST /api/personnes:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
  
