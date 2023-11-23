import appConfig from "@/appConfig";

import { getStateVars } from "./getStateVarsByFetch";
import { getAttestations } from "./getAttestations";


export interface Attestation {
  unit: string;
  attestor_address: string;
  profile: object;
}

export const getGithubUsersByWallet = async (address: string) => {
  try {
    const attestations = await getAttestations(address);
    const githubNames: string[] = [];

    attestations.forEach((a: any) => {
      if (a.attestor_address === appConfig.ATTESTOR && a?.profile && a.profile.github_username) {
        if (!githubNames.includes(a.profile.github_username)) {
          githubNames.push(a.profile.github_username);
        }
      }
    });

    const getters = githubNames.map((user) => getStateVars({
      address: appConfig.ATTESTOR_AA!,
      var_prefix: `u2a_${user}`
    }).then((data: any) => ({ user, adr: data?.[`u2a_${user}`] })));

    const users = await Promise.all(getters);

    return users.filter(({ adr }) => (address === adr) && typeof adr === 'string').map((item) => item.user) as string[];

  } catch {
    return null
  }
}