import appConfig from "@/appConfig"
import { getStateVars } from "./getStateVarsByFetch"

interface INicks {
  [address: string]: string;
}
export const getNicks = async (address?: string) => {
  const stateVars = await getStateVars({ address: appConfig.AA_ADDRESS!, var_prefix: `nickname*${address || ''}` });
  const nicks: INicks = {};

  Object.entries(stateVars).map(([key, nick]) => {
    const [_, address] = key.split('*');
    nicks[address] = String(nick);
  });

  return nicks;
}