const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = async (command) => {
  if (!url || !token) throw new Error(`Missing env vars: url=${!!url} token=${!!token}`);
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
  });
  return res.json();
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');
  if (!key) return Response.json({ error: 'Key required' }, { status: 400 });
  try {
    const { result } = await redis(['GET', key]);
    return Response.json({ value: result ? JSON.parse(result) : null });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request) {
  const { key, value } = await request.json();
  if (!key) return Response.json({ error: 'Key required' }, { status: 400 });
  try {
    await redis(['SET', key, JSON.stringify(value)]);
    return Response.json({ success: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
