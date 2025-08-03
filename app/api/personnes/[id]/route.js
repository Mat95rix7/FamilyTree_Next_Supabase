import { NextResponse } from 'next/server';
import { getOnePersonne, updatePersonne, deletePersonne } from '@/app/services/personnesService';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const personne = await getOnePersonne(id);
    return NextResponse.json(personne);
  } catch (error) {
    const status = error.message === 'Personne non trouvée' ? 404 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    
    // Récupérer les données du formulaire
    const formData = await request.formData();
    
    // Passer directement le FormData à updatePersonne
    const personne = await updatePersonne(id, formData);
    
    return NextResponse.json(personne);
  } catch (error) {
    console.error('Erreur dans PUT /api/personnes/[id]:', error);
    const status = error.message === 'Personne non trouvée' ? 404 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const result = await deletePersonne(id);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Erreur dans DELETE /api/personnes/[id]:', error);
    const status = error.message === 'Personne non trouvée' ? 404 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}