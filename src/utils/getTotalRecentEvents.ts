"use server";

const request = async (path: string, body = {}) => {
  const response = await fetch(`https://obyte.org/api/${path}`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    method: "post",
    body: JSON.stringify(body),
    next: { revalidate: 0 }
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
}

export const getAaResponses = async (aaOrAas: string | string[]) => {
  let params = {};

  if (typeof aaOrAas === "string") {
    params.aa = aaOrAas;
  } else {
    params.aas = aaOrAas;
  }

  return await request("get_aa_responses", params) as IResponse[];
}