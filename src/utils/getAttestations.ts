import appConfig from "@/appConfig";

export const getAttestations = async (walletAddress: string) => {
  const response = await fetch(`${appConfig.HUB_ADDRESS}/get_attestations`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    method: "post",
    body: JSON.stringify({
      address: walletAddress
    })
  });
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
};