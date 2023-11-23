"use client";

import { DocumentDuplicateIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import cn from "classnames";
import Tooltip from "rc-tooltip";
import { FC, InputHTMLAttributes, ReactNode, useRef } from "react";
import { CopyToClipboard } from 'react-copy-to-clipboard';

import { QuestionTooltip } from "../QuestionTooltip/QuestionTooltip";

interface IInput extends InputHTMLAttributes<"text"> {
	error?: ReactNode;
	extra?: ReactNode;
	currency?: string;
	placeholder?: string;
	loading?: boolean;
	suffix?: ReactNode;
	className?: string;
	disabled?: boolean;
	copy?: boolean;
	copyText?: string;
	token?: string;
	setToken?: (token: string) => void;
	label?: ReactNode;
	labelKey?: string;
	labelDescription?: ReactNode;
}

export const Input: FC<IInput & InputHTMLAttributes<"text">> = ({
	error = "",
	extra = "",
	currency,
	value,
	loading = false,
	suffix = "",
	className = "",
	disabled = false,
	copy = false,
	copyText = "",
	token,
	setToken,
	label = "",
	labelDescription = "",
	labelKey = 'label_key',
	...rest
}) => {
	const suffixStyle =
		error && typeof error === "string" ? { marginRight: 45 } : {};
	const suffixWrapRef = useRef(null);
	const tokenSelectorWrapRef = useRef(null);

	return (
		<>
			{label && (
				<label
					htmlFor={labelKey}
					className="block mb-2 text-sm font-medium leading-none select-none text-white/60"
				>
					{label}{" "}
					{labelDescription && (
						<QuestionTooltip description={<span>{labelDescription}</span>} />
					)}
				</label>
			)}
			<div className={cn("relative flex", className)}>
				<input
					id={labelKey}
					value={loading ? "" : value}
					autoComplete="off"
					{...rest}
					disabled={disabled}
					style={
						(suffix || copy)
							? { paddingRight: suffixWrapRef?.current && suffixWrapRef?.current.offsetWidth ? (suffixWrapRef?.current.offsetWidth + 8) : (copy ? 36 : 0) }
							: (token && tokenSelectorWrapRef?.current
								? { paddingRight: tokenSelectorWrapRef?.current.offsetWidth + 4 }
								: (copy ? { paddingRight: 20 } : {}))
					}
					className={cn(
						"shadow-sm border-none",
						"block w-full focus:border-primary ring-1 ring-gray-300 h-[40px] rounded-lg  bg-white text-gray-950 px-4 text-md font-normal focus:ring-2 focus:outline-none focus:ring-primary",
						{
							"ring-red-500 focus:ring-red-500":
								error,
							"cursor-not-allowed bg-gray-200/50 text-gray-950/50":
								disabled,
						}
					)}
				/>
				{loading && <div className="absolute inset-y-0 left-4 opacity-50 flex items-center h-[45px]">
					<svg
						aria-hidden="true"
						className={`w-4 h-4 text-primary/60 animate-spin fill-primary ${className}`}
						viewBox="0 0 100 101"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
							fill="currentColor"
						/>
						<path
							d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
							fill="currentFill"
						/>
					</svg>
				</div>}
				<div
					className="absolute inset-y-0 right-0 flex items-center h-[40px]"
					ref={suffixWrapRef}
				>
					{suffix ? (
						<div
							className={cn(
								"text-gray-950 truncate",
								{ "pr-1": currency },
								{ "pr-5": !currency },
								{ "pr-0": error && typeof error === "string" }
							)}
							style={suffixStyle}
						>
							{suffix}
						</div>
					) : null}

					{(copy && copyText) && <div className="pr-[8px]">
						<Tooltip
							placement="top"
							trigger={["hover"]}
							overlayClassName="bg-gray-950"
							// overlayInnerStyle={{ background: "#ccc" }}
							overlay={<span>Click to copy</span>}
						>
							<CopyToClipboard text={copyText}><DocumentDuplicateIcon aria-hidden="true" className="h-[20px] w-[20px] block cursor-pointer" /></CopyToClipboard>
						</Tooltip>

					</div>}

					{error && typeof error === "string" ? (
						<div className="absolute inset-y-0 right-0 flex items-center pr-3">
							<Tooltip
								placement="top"
								trigger={["hover"]}
								overlayInnerStyle={{ background: "#EF4444" }}
								overlay={<span>{error}</span>}
							>
								<ExclamationCircleIcon
									className="w-5 h-5 text-red-500"
									aria-hidden="true"
								/>
							</Tooltip>
						</div>
					) : null}
				</div>
			</div>

			{extra && !error && <p className="text-sm text-white">{extra}</p>}
		</>
	);
};
