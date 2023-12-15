
export async function POST(request: Request) {
  const req = await request.json();
  console.error("TTFB", req.pathname, req.value, req.id);

  return new Response(null, {
    headers: { 'content-type': 'application/json' },
    status: 200
  });
}
