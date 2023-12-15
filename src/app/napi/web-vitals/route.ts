import { writeFile } from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  const req = await request.json();
  const logPath = path.join(__dirname, "../../../../../logs.txt");

  try {
    await writeFile(logPath,`${req.pathname} ${req.value} ${req.id || ""}\n`, { flag: "a" }); //
  } catch (e) {
    console.error(e);
  }

  return new Response(null, {
    headers: { 'content-type': 'application/json' },
    status: 200
  });
}
