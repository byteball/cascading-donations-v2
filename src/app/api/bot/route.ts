import { redirect } from "next/navigation";

import appConfig from "@/appConfig";

export async function GET() {
  redirect(appConfig.STATUS_BOT_PAIRING_URL!);
}
