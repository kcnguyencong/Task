import { ensureSchema } from '../_lib/db';
import { getSessionUser } from '../_lib/auth';

export async function GET(request: Request): Promise<Response> {
  try {
    await ensureSchema();
    const user = await getSessionUser(request);
    return Response.json({ user });
  } catch (error) {
    console.error('Auth /me error:', error);
    return Response.json(
      { user: null, error: (error as Error).message },
      { status: 500 }
    );
  }
}
