import { redirect } from "next/navigation";

import appConfig from "@/appConfig";

export async function GET() {
  redirect(`obyte:${appConfig.BOT_PAIRING_CODE}`);
}
