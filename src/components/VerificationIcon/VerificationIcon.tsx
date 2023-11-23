"use client";

import { CheckCircleIcon } from "@heroicons/react/24/outline";
import Tooltip from "rc-tooltip";

export const VerificationIcon = () => {
  return <Tooltip
    placement="top"
    trigger={["hover"]}
    overlayClassName="max-w-[250px]"
    overlay={<span>Fully setup. Maintainer has added a banner to their README.</span>}
  >
    <CheckCircleIcon className="w-8 h-8 stroke-primary" />
  </Tooltip>
}