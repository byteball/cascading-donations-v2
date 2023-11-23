"use client";

import { ReactElement, forwardRef, useState } from "react";
import Tooltip from "rc-tooltip";
import QRCode from "qrcode.react";
import { QrCodeIcon } from "@heroicons/react/24/outline";
import cn from "classnames";

import { Button, Modal } from "..";
import { IButtonProps } from "../Button/Button";


interface IQRButtonProps extends IButtonProps {
  href: string;
}

export const QRButton = forwardRef<ReactElement, IQRButtonProps>(
  ({ children, href = "", disabled, className = "", block = false, type = "default", onClick, ...rest }, ref) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    return (
      <div
        onClick={onClick}
        className={cn("inline-flex flex-nowrap rounded-md shadow-none isolate items-center", className, {
          "shadow-none": type === "text-primary",
          "pointer-events-none": disabled,
        })}
      >
        <Modal
          wrapClassName="sm:max-w-[400px]"
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          advice={<div className="text-xs text-center">
            Install Obyte wallet for{" "}
            <a className="text-primary" target="_blank" rel="noopener" href="https://apps.apple.com/us/app/byteball/id1147137332?platform=iphone">
              iOS
            </a>{" "}
            or{" "}
            <a className="text-primary" target="_blank" rel="noopener" href="https://play.google.com/store/apps/details?id=org.byteball.wallet">
              Android
            </a>{" "}<br/>
            if you don't have one yet
          </div>}
          trigger={<div className="flex">
            <Tooltip
              placement="top"
              trigger={["hover"]}
              overlay={
                <span>
                  Send the transaction from <br /> your mobile phone
                </span>
              }
            >
              <div>
                <Button
                  disabled={disabled}
                  // onClick={() => setVisible((v) => !v)}
                  className={cn("pr-0 rounded-r-none", { "h-[42px]": type !== "text-primary" })}
                  type={type}
                  {...rest}
                >
                  <QrCodeIcon
                    className={cn("h-5 w-5", { "-ml-0.5 mr-3": type !== "text-primary", "mt-[5px]": type === "text-primary" && !text })}
                    aria-hidden="true"
                  />
                </Button>
              </div>
            </Tooltip>
          </div>}
          title={
            <div className="w-full text-center">
              <span className="">
                Scan this QR code <br /> with your mobile phone
              </span>
            </div>
          }
        >
          <div className="flex justify-center">
            <a href={href}>
              <QRCode renderAs="svg" size={240} className="qr" bgColor="#fff" value={href} />
            </a>
          </div>

        </Modal>

        <Tooltip
          placement="top"
          trigger={["hover"]}
          overlay={
            <span>
              This will open your Obyte wallet <br /> installed on this computer and <br /> send the transaction
            </span>
          }
        >
          <div>
            <Button
              ref={ref}
              type={type}
              href={href}
              disabled={disabled}
              {...rest}
              onClick={undefined}
              className={cn("inline-block", {
                "pl-2 rounded-l-none ": href,
                "leading-none": type !== "text-primary",
                "h-[42px]": !type.startsWith("text"),
                "pl-1": type.startsWith("text"),
              })}
            >
              <span className="overflow-hidden truncate text-ellipsis sm:max-w-full max-w-[140px]">{children}</span>
            </Button>
          </div>
        </Tooltip>

      </div>
    );
  }
);