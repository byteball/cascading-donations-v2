import appConfig from "@/appConfig";

export interface IGetStateVars {
  address: string;
  var_prefix?: string;
  var_prefix_from?: string;
  var_prefix_to?: string;
}

interface IStateVars {
  [key: string]: any;
}

export const getStateVars = async ({ address, var_prefix, var_prefix_from, var_prefix_to }: IGetStateVars): Promise<IStateVars> => {

  const params: IGetStateVars = { address };

  if (var_prefix_from) {
    params.var_prefix_from = var_prefix_from;
  }

  if (var_prefix_to) {
    params.var_prefix_to = var_prefix_to;
  }

  if (!var_prefix_from && !var_prefix_to) {
    params.var_prefix = var_prefix;
  }

  return fetch(`${appConfig.HUB_ADDRESS}/get_aa_state_vars`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    method: "post",
    body: JSON.stringify(params),
    next: { revalidate: 0 }
  }).then(async response => {
    if (!response.ok) {
      const errorBody = await response.text();
      let errorObject = {};

      try {
        errorObject = errorBody && JSON.parse(errorBody);
      } catch { }

      if (errorObject && ("error" in errorObject)) {
        throw new Error(errorObject.error);
      } else {
        throw new Error("unknown error");
      }
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    } else {
      return data?.data;
    }
  })
};

export const getAllStateVars = async ({ address, var_prefix_from }: IGetStateVars): Promise<IStateVars> => {
  let stateVars = await getStateVars({ address, var_prefix_from });

  let lastKey = Object.keys(stateVars).pop();
  let lastLength = Object.keys(stateVars).length;

  while (lastLength > 2000) {
    const newStateVars = await getStateVars({ address, var_prefix_from });

    stateVars = { ...stateVars, ...newStateVars }

    lastKey = Object.keys(newStateVars).pop();
    lastLength = Object.keys(newStateVars).length;
  }

  return stateVars;
}
