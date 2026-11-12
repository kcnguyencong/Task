import { buildClearSessionCookie } from '../_lib/auth';

export async function POST(): Promise<Response> {
  return Response.json(
    { ok: true },
    {
      status: 200,
      headers: {
        'Set-Cookie': buildClearSessionCookie(),
      },
    }
  );
}
