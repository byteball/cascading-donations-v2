import { writeFile } from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  const req = await request.json();
  const logPath = path.join(__dirname, "../../../../../log.txt");

  try {
    await writeFile(logPath,`${req.pathname} ${req.value} ${request.headers.get("User-Agent") || ""} ${new Date().toISOString()} \n`, { flag: "a" });
  } catch (e) {
    console.error(e);
  }

  return new Response(null, {
    headers: { 'content-type': 'application/json' },
    status: 200
  });
}