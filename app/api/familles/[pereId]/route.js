// app/api/famille/[pereId]/route.js
import { getFamilleByHommeMarie } from '@/app/services/famillesService';

export async function GET(request, { params }) {
  const { pereId } = params;

  if (!pereId) {
    return Response.json({ error: 'Paramètre pereId manquant' }, { status: 400 });
  }

  try {
    const data = await getFamilleByHommeMarie(pereId);
    return Response.json(data);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
