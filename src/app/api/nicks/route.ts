import { getNicks } from "@/utils/getNicks";

export async function GET() {
  const nicks = await getNicks();

  return new Response(JSON.stringify({ data: nicks }), {
    headers: { 'content-type': 'application/json' },
  });
}
