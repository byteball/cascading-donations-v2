import appConfig from "@/appConfig";
import { IRules } from "@/utils/getRepoRules";
import { getAllStateVars } from "@/utils/getStateVarsByFetch";

export interface IPools {
  [asset: string]: number;
}

export interface IPoolsData {
  [pool: string]: IPools;
}

export interface IRulesData {
  [pool: string]: IRules;
}

export async function GET(request: Request) {
  const owner = request.url.slice(1).split('/')[5];

  if (owner && owner.length > 0) {
    const data: any = await getAllStateVars({ address: appConfig.AA_ADDRESS!, var_prefix_from: `${owner}/` }).then((stateVars) => {
      const rules: any = {};
      const pools: IPoolsData = {};
      const notificationAas: { [key: string]: string } = {};

      Object.keys(stateVars).forEach((key) => {
        if (key.startsWith(`${owner}/`) && key.endsWith('*rules') && stateVars[key]) {
          const repoName = key.split('*')[0];
          const sum = Object.values<number>(stateVars[key]).reduce((a, b) => a + b, 0);

          const ownerPercent = sum < 100 ? 100 - sum : 0;
          
          rules[repoName] = {
            ...stateVars[key],
            [repoName]: ownerPercent,
          };

        } else if (key.startsWith(`${owner}`) && key.includes("*pool*")) {
          const [repo, _, asset] = key.split('*');
          const amount = stateVars[key];

          if (!pools[repo]) {
            pools[repo] = {};
          }

          if (Number(amount) > 0) {
            pools[repo][asset] = amount;
          }
        } else if (key.includes("notification_aa")) {
          const [repo] = key.split('*');
          notificationAas[repo] = stateVars[key];
        }
      });

      return { rules, pools, notificationAas };
    });

    return new Response(JSON.stringify({ data }), {
      headers: { 'content-type': 'application/json' },
    });
  } else {
    return new Response(JSON.stringify({ error: 'not found' }), { status: 500, headers: { 'content-type': 'application/json' } })
  }
}