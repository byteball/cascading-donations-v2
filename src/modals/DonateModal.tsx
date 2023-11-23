"use client";

import { FC, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { findBridge, findOswapPool, transferEVM2Obyte } from "counterstake-sdk";
import { XCircleIcon } from "@heroicons/react/24/outline";

import { Button, Input, Modal, Select, Checkbox } from "@/components";
import { QRButton } from "@/components/QRButton/QRButton";

import { useDispatch } from "@/store";
import { selectWalletAddress } from "@/store/slices/settingsSlice";
import { ITokenMeta, getTokens } from "@/store/slices/tokensSlice";
import { sendNotification } from "@/store/thunks/sendNotification";

import client from "@/services/ws.client";

import { generateLink, getAvatarUrl, getCountOfDecimals, toLocalString, truncate } from "@/utils";

import appConfig from "@/appConfig";

interface IDonationModalTitleProps {
  owner: string;
  repo: string;
}

type network = "Obyte" | "Ethereum" | "BSC" | "Polygon" | "Kava";
type poolStatus = "loading" | "exists" | "not-exists"

export const DonationModalTitle: FC<IDonationModalTitleProps> = ({ owner, repo }) => (
  <div className="flex items-center space-x-4">
    <div><img src={getAvatarUrl(owner)} className="w-8 rounded-full" /></div>
    <div className="text-lg">{truncate(`${owner}/${repo}`, 28)}</div>
  </div>
)

interface IDonateModalProps {
  owner: string;
  repo: string;
}

interface ITokenState extends ITokenMeta {
  asset: string;
}

export const DonateModal: FC<IDonateModalProps> = ({ owner, repo }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [network, setNetwork] = useState<network>("Obyte");
  const [token, setToken] = useState<ITokenState | null>(null);
  const [amount, setAmount] = useState<string>("");

  const [convert, setConvert] = useState(true);
  const [maxAmount, setMaxAmount] = useState<number | undefined>();
  const [poolStatus, setPoolStatus] = useState<poolStatus>("loading");
  const [donationProcessIsActive, setDonationProcessIsActive] = useState<boolean>(false);

  const tokens = useSelector(getTokens);
  const walletAddress = useSelector(selectWalletAddress);

  const btnRef = useRef<any>(null);

  const dispatch = useDispatch();

  // calcs
  const fullName = `${owner}/${repo}`;
  const networks = Object.keys(tokens);
  const tokensByNetwork = tokens[network];

  useEffect(() => {
    if (tokens && network) {

      const tokensByNetwork = tokens[network];

      if (tokensByNetwork) {
        const firstToken = Object.entries(tokensByNetwork)[0];

        setToken({
          asset: firstToken[0],
          ...firstToken[1],
        });
      }
    }
  }, [network, tokens]);


  // funcs
  const handleAmount = (ev: any) => {
    const value = ev.target.value;
    const reg = /^[0-9.]+$/;
    if ((token && value.split(".").length <= 2 && (reg.test(String(value)) && getCountOfDecimals(value) <= token.decimals)) || value === "") {
      setAmount(value);
    }
  };

  const findPool = async () => {
    if (token?.obyte_asset) {
      const pool = await findOswapPool(token.obyte_asset, "base", appConfig.ENVIRONMENT === "testnet", client);
      setPoolStatus(pool ? "exists" : "not-exists");
    }
  }

  const getMaxAmount = async () => {
    if (token && token.asset) {
      if (network !== "Obyte") {
        setMaxAmount(undefined)
        try {
          const max_amount = await findBridge(network, "Obyte", token.asset, appConfig.ENVIRONMENT === "testnet").then(bridge => bridge.max_amount || 0);
          setMaxAmount(max_amount);
        } catch {
          setMaxAmount(0);
        }

      } else {
        setMaxAmount(undefined)
      }
    } else {
      setMaxAmount(undefined);
    }
  }

  useEffect(() => {
    if (network !== "Obyte") {
      setConvert(true);
      setPoolStatus("loading");
      findPool();
      getMaxAmount();
    } else {
      setPoolStatus("not-exists");
    }
  }, [token]);

  const handleEnter = (ev: React.KeyboardEvent) => {
    if (ev.key === "Enter" && btnRef.current) {
      btnRef.current.click();
    }
  }

  const donate = async () => {
    if (!network || !token || network === "Obyte") {
      dispatch(sendNotification({ type: "error", "title": "Unknown error" }));
      return null;
    }

    setDonationProcessIsActive(true);

    if (poolStatus === "exists" && convert) {
      try {
        await transferEVM2Obyte({
          src_network: network,
          src_asset: token.symbol,
          dst_network: "Obyte",
          dst_asset: "GBYTE",
          amount: amount,
          recipient_address: appConfig.AA_ADDRESS,
          data: { donate: 1, repo: fullName, donor: walletAddress ? walletAddress : undefined },
          assistant_reward_percent: 1.0,
          testnet: false, // for for testnet
          obyteClient: client
        });

        dispatch(sendNotification({ type: "success", "title": "Donation has been sent" }));
        // @ts-ignore
      } catch ({ message, reason }) {
        dispatch(sendNotification({ type: "error", "title": reason || message || "Unknown error" }));
      }
    } else {
      try {
        await transferEVM2Obyte({
          src_network: network,
          src_asset: token.symbol,
          dst_network: "Obyte",
          amount: amount,
          recipient_address: appConfig.AA_ADDRESS,
          data: { donate: 1, repo: fullName, donor: walletAddress ? walletAddress : undefined },
          assistant_reward_percent: 1.0,
          testnet: false, // for for testnet
          obyteClient: client
        });

        dispatch(sendNotification({ type: "success", "title": "Donation has been sent" }));

        // @ts-ignore
      } catch ({ message, reason }) {
        dispatch(sendNotification({ type: "error", "title": reason || message || "Unknown error" }));
      }
    }


    setDonationProcessIsActive(false);
  }

  const linkToDonate = token && network === "Obyte" ? generateLink({ amount: Math.ceil(Number(amount) * 10 ** token.decimals) + (token.asset === "base" ? 1e4 : 0), aa: appConfig.AA_ADDRESS!, asset: token?.asset, data: { donate: 1, repo: String(fullName).toLowerCase() }, from_address: walletAddress }) : "";


  if (!tokens || !tokensByNetwork) return <Button loading type="primary">Donate</Button>;

  const donationUsdAmount = token?.price ? token.price * Number(amount) : 0;

  return <Modal
    isOpen={isOpen}
    setIsOpen={setIsOpen}
    advice={network === "Obyte" ? <small>0.00001 GB will be added as a fee</small>
      : <small>To accept donations from networks other than Obyte, we use <a target="_blank" className="text-primary" href="https://counterstake.org/" rel="noopener">counterstake.org</a>. 1% will be subtracted from the donated amount to pay for the cross-chain transfer and it'll take a bit longer.</small>}
    title={<DonationModalTitle owner={owner} repo={repo} />}
    trigger={<Button type="primary">Donate</Button>}
  >
    <div className="">
      <Select value={network} label="Network" search={false} onChange={(network: network) => setNetwork(network)}>
        {networks.map(network => <Select.Option key={network} value={network} iconUrl={`/${network}.svg`}>{network}</Select.Option>)}
      </Select>

      {network !== "Obyte" && !walletAddress ? <div className="text-red-800 text-sm mt-[10px]">To have your donations tracked to you when you donate from other networks, please add your Obyte address.</div> : null}

      <Select value={token?.asset} search={false} label="Token" className="mt-4" onChange={(asset: string) => setToken(({ asset, ...tokensByNetwork[asset] }))}>
        {Object.entries(tokensByNetwork).map(([asset, meta]: [string, ITokenMeta]) => <Select.Option key={asset} value={asset} iconUrl={[`${appConfig.ICON_CDN_URL}/${meta.symbol}.svg`, `https://cdn.jsdelivr.net/npm/cryptocurrency-icons@0.17.2/svg/color/${meta.symbol.toLowerCase()}.svg`]}>{meta.symbol}</Select.Option>)}
      </Select>

      <Input autoFocus onChange={handleAmount} onKeyDown={handleEnter} value={amount} placeholder="Example 10" label="Amount" suffix={token?.symbol} className="mt-4" />

      {poolStatus === "exists" && <Checkbox
        label="Convert to GBYTE"
        name="convert"
        className="mt-4"
        checked={convert}
        onChange={(e) => setConvert(e.target.checked)}
      />}

      {(Number(amount) > (maxAmount || 0) && network !== "Obyte") ? <div className="rounded-md bg-red-50 p-4 mt-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
          </div>

          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Amount too large, assistants can help with only {maxAmount} {token?.symbol}</h3>
          </div>
        </div>
      </div> : null}

      <div className="flex flex-wrap items-center space-x-2 mt-4">
        {network === "Obyte"
          ? <QRButton
            ref={btnRef}
            type="primary"
            href={linkToDonate}
            disabled={!token || !amount || !walletAddress}
          >
            Donate
          </QRButton>
          : <Button
            type="primary"
            ref={btnRef}
            disabled={poolStatus === "loading" || Number(amount) === 0 || !token || amount === "." || typeof amount !== "string" || maxAmount === undefined || (Number(amount) > (maxAmount || 0))}
            onClick={donate}
            loading={donationProcessIsActive || ((maxAmount === undefined) && !!token)}>
            Donate
          </Button>}

        {token?.price && amount && Number(amount) && (Number(amount) <= (maxAmount || 0)) ? <div className="text-gray-400 text-sm">
          ≈ ${toLocalString(donationUsdAmount.toFixed(2))}
        </div> : null}
      </div>
    </div>
  </Modal>
}