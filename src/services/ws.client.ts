"use client"

import obyte from "obyte";

import { store } from "@/store";
import { getAAPayloadByMassages } from "@/utils/getAAPayloadByMassages";
import { sendNotification } from "@/store/thunks/sendNotification";
import { getGithubAccountsThunk } from "@/store/thunks/getAttestations";

import appConfig from "@/appConfig";

const client = typeof window != 'undefined' ? new obyte.Client(`wss://obyte.org/bb${appConfig.ENVIRONMENT === "testnet" ? "-test" : ""}`, {
  testnet: appConfig.ENVIRONMENT === "testnet",
  reconnect: true,
}) : null;

client?.onConnect(() => {
  console.log("ws connected");

  client.justsaying("light/new_aa_to_watch", {
    aa: appConfig.AA_ADDRESS
  });

  const heartbeat = setInterval(function () {
    client.api.heartbeat();
  }, 10 * 1000);

  const checkAttestationsIntervalId = setInterval(() => {
    store.dispatch(getGithubAccountsThunk());
  }, 1000 * 60 * 30); // 30 minutes


  client.subscribe(async (_, result) => {
    const { subject, body, } = result[1];
    const { unit, aa_address } = body;

    const messages = unit?.messages;
    const state = store.getState();
    const payload = getAAPayloadByMassages(messages);

    const author = payload?.donor || unit?.authors?.[0]?.address;

    if (state.settings.walletAddress) {
      if (subject === "light/aa_request") {

        if (state.settings.walletAddress === author) {
          store.dispatch((sendNotification({
            type: "success",
            title: "Received your transaction",
            description: "The interface will update after the transaction stabilizes"
          })));
        }
 
      } else if (subject === "light/aa_response" && aa_address === appConfig.AA_ADDRESS) {
        // response from AA
      }
    }
  });

  // @ts-ignore
  client.client.ws.addEventListener("close", () => {
    clearInterval(heartbeat);
    clearInterval(checkAttestationsIntervalId);
  });
});

export default client;