const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = async (command) => {
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
  const { result } = await redis(['GET', key]);
  return Response.json({ value: result ? JSON.parse(result) : null });
}

export async function POST(request) {
  const { key, value } = await request.json();
  if (!key) return Response.json({ error: 'Key required' }, { status: 400 });
  await redis(['SET', key, JSON.stringify(value)]);
  return Response.json({ success: true });
}
