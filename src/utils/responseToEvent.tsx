import moment from "moment";
import Link from "next/link";
import { ReactNode } from "react";

import { getTokens } from "@/services/backend.server";
import appConfig from "@/appConfig";

export interface IRecentEvent {
  message: ReactNode;
  repository: string;
  author: any;
  time: string;
  link: string;
}


export const responseToEvent = async (responses: IResponse[]) => {
  const testnet = false;
  const tokens = await getTokens();

  return responses?.map(({ response, trigger_address, trigger_unit, timestamp }) => {
    const responseVars = response.responseVars;
    
    let type: string | undefined = undefined;
    let message: ReactNode;
    let repository: string | undefined = undefined;
    const time = moment.unix(timestamp).fromNow();
    const link = `https://${appConfig.ENVIRONMENT === "testnet" ? "testnet" : ""}explorer.obyte.org/#${trigger_unit}`;

    if (responseVars && responseVars?.message) {
      if (responseVars.message.includes("Rules for ")) {
        type = "set_rules"
        repository = responseVars.message.split(" ")?.[2];
        const newRules = responseVars.new_rules && JSON.parse(responseVars.new_rules);
        message = <span>Rules for <Link className="font-medium text-gray-950" href={`/repo/${repository}`}>{repository}</Link> have been changed to {(newRules && Object.keys(newRules).length > 0) ? Object.entries(newRules).map(([fullName, percent]) => `${fullName} ${percent}%`).join(" ") : `${repository} 100%`}</span>
      } else if (responseVars.message.includes("Successful donation to ")) {
        type = "donate"
        repository = responseVars.message.split(" ")?.[3];
        const donatedVarName = Object.keys(responseVars).find(v => v.includes("donated_in_"));

        if (donatedVarName) {
          const asset = donatedVarName.split("_")?.[2];
          const amount = responseVars[donatedVarName];
          const donor = responseVars?.donor || trigger_address;
          const token = tokens.get(asset);
          
          message = <span><a target="_blank" className="font-medium text-gray-950" rel="noopener" href={`https://${testnet ? "testnet" : ""}explorer.obyte.org/#${donor}`}>{donor.slice(0, 10)}...</a> has donated {amount / (10 ** (token ? (token.decimals || 0) : 0))} {token ? token.symbol : asset.slice(0, 5)} to <Link  className="font-medium text-gray-950" href={`/repo/${repository}`}>{repository}</Link></span>
        } else {
          return null;
        }

      } else if (responseVars.message.includes("Distribution for ")) {
        type = "distribution"
        repository = responseVars.message.split(" ")?.[3];
        const asset = responseVars.message.split(" ")?.[6];
        const token = tokens.get(asset);

        message = <span>Distribution of {token ? token.symbol : asset.slice(0, 5)} for <Link className="font-medium text-gray-950" href={`/repo/${repository}`}>{repository}</Link></span>
      }
    }

    if (type && repository && message) {
      return {
        repository,
        author: responseVars?.donor || trigger_address,
        message,
        link,
        time
      }
    } else {
      return null
    }

  }).filter(e => e !== null);
}