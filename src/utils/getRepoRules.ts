import { isEmpty } from "lodash";

import { getStateVars } from "./getStateVarsByFetch";

import appConfig from "@/appConfig";

interface IStateVars {
  [key: string]: any;
}

export interface IRules {
  [key: string]: number;
}

export const getRepoRules = async (fullName: string): Promise<[IRules, boolean]> => {

  const var_prefix = `${fullName}*rules`;
  let exists = false;
  let rules: IRules = {};

  // if (!client) return [rules, false];
  
  let rulesStateVars = await getStateVars({address: appConfig.AA_ADDRESS!, var_prefix}) as IStateVars;
  
  // await client.api.getAaStateVars({
  //   address: appConfig.AA_ADDRESS!,
  //   var_prefix
  // }) as IStateVars;

  if (isEmpty(rulesStateVars)) {
    rules = { [fullName]: 100 };
    return [rules, exists];
  } else {
    exists = true;
  }

  rules = rulesStateVars?.[var_prefix] as IRules || {};

  let p = 0;

  rules && Object.keys(rules).forEach(key => {
    p += Number(rules[key])
  })


  if (p < 100) {
    rules = {
      ...rules,
      [fullName]: 100 - p
    }
  }

  return [rules, exists];
}
