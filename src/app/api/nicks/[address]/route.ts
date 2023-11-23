import { getNicks } from "@/utils/getNicks";

export async function GET(request: Request) {
  const address = request.url.slice(1).split('/')[5];
  const nicks = await getNicks(address);

  return new Response(JSON.stringify({ data: nicks }), {
    headers: { 'content-type': 'application/json' },
  });
}
