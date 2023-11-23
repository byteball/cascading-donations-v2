import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import Tooltip from "rc-tooltip";
import { FC, ReactNode } from "react";

interface IQuestionTooltip {
  description: ReactNode;
  className?: string;
}

export const QuestionTooltip: FC<IQuestionTooltip> = ({ description, className = "" }) => {
  if (!description) return null;

  return (
    <Tooltip
      placement="top"
      trigger={["hover"]}
      overlayClassName="max-w-[250px]"
      overlay={<span>{description}</span>}
    >
      <QuestionMarkCircleIcon className={`inline opacity-60 ${className}`} />
    </Tooltip>
  );
};
