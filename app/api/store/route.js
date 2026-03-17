// Simple in-memory store shared across all connected clients.
// Data resets when the server restarts — fine for a party game session.
const store = new Map();

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');
  if (!key) return Response.json({ error: 'Key required' }, { status: 400 });
  return Response.json({ value: store.has(key) ? store.get(key) : null });
}

export async function POST(request) {
  const { key, value } = await request.json();
  if (!key) return Response.json({ error: 'Key required' }, { status: 400 });
  store.set(key, value);
  return Response.json({ success: true });
}
