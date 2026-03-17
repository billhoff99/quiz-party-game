const store = global._quizStore ?? (global._quizStore = new Map());

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
