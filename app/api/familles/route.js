import { getHommesMaries } from '@/app/services/famillesService';

export async function GET() {
  try {
    const hommes = await getHommesMaries();
    return Response.json(hommes);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
