"use client";

import { KeyboardEventHandler, useRef, useState } from "react";
import * as EmailValidator from 'email-validator';

import { Button, Input } from "@/components";

import appConfig from "@/appConfig";

const navigation = {
	social: [
		{
			name: 'Discord',
			href: "https://discord.obyte.org/",
			icon: (props: any) => (
				<svg viewBox="0 0 24 24" {...props}>
					<path stroke="none" d="M0 0h24v24H0z" fill="none" />
					<path d="M14.983 3l.123 .006c2.014 .214 3.527 .672 4.966 1.673a1 1 0 0 1 .371 .488c1.876 5.315 2.373 9.987 1.451 12.28c-1.003 2.005 -2.606 3.553 -4.394 3.553c-.732 0 -1.693 -.968 -2.328 -2.045a21.512 21.512 0 0 0 2.103 -.493a1 1 0 1 0 -.55 -1.924c-3.32 .95 -6.13 .95 -9.45 0a1 1 0 0 0 -.55 1.924c.717 .204 1.416 .37 2.103 .494c-.635 1.075 -1.596 2.044 -2.328 2.044c-1.788 0 -3.391 -1.548 -4.428 -3.629c-.888 -2.217 -.39 -6.89 1.485 -12.204a1 1 0 0 1 .371 -.488c1.439 -1.001 2.952 -1.459 4.966 -1.673a1 1 0 0 1 .935 .435l.063 .107l.651 1.285l.137 -.016a12.97 12.97 0 0 1 2.643 0l.134 .016l.65 -1.284a1 1 0 0 1 .754 -.54l.122 -.009zm-5.983 7a2 2 0 0 0 -1.977 1.697l-.018 .154l-.005 .149l.005 .15a2 2 0 1 0 1.995 -2.15zm6 0a2 2 0 0 0 -1.977 1.697l-.018 .154l-.005 .149l.005 .15a2 2 0 1 0 1.995 -2.15z" strokeWidth="0" fill="currentColor" />
				</svg>
			)
		},
		{
			name: 'Telegram',
			href: "https://t.me/obyteorg",
			icon: (props: any) => (
				<svg viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
					<path stroke="none" d="M0 0h24v24H0z" fill="none" />
					<path d="M15 10l-4 4l6 6l4 -16l-18 7l4 2l2 6l3 -4" />
				</svg>
			)
		},
		{
			name: 'Twitter',
			href: 'https://twitter.com/ObyteOrg',
			icon: (props: any) => (
				<svg fill="currentColor" viewBox="0 0 24 24" {...props}>
					<path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
				</svg>
			),
		},
		{
			name: 'Medium',
			href: 'https://blog.obyte.org/',
			icon: (props: any) => (
				<svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"  {...props}>
					<path
						d="M180.5,74.262C80.813,74.262,0,155.633,0,256S80.819,437.738,180.5,437.738,361,356.373,361,256,280.191,74.262,180.5,74.262Zm288.25,10.646c-49.845,0-90.245,76.619-90.245,171.095s40.406,171.1,90.251,171.1,90.251-76.619,90.251-171.1H559C559,161.5,518.6,84.908,468.752,84.908Zm139.506,17.821c-17.526,0-31.735,68.628-31.735,153.274s14.2,153.274,31.735,153.274S640,340.631,640,256C640,171.351,625.785,102.729,608.258,102.729Z" />
				</svg>
			),
		},
		{
			name: 'Facebook',
			href: 'https://www.facebook.com/obyte.org',
			icon: (props: any) => (
				<svg fill="currentColor" viewBox="0 0 24 24" {...props}>
					<path
						fillRule="evenodd"
						d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
						clipRule="evenodd"
					/>
				</svg>
			),
		},
		{
			name: 'YouTube',
			href: 'https://www.youtube.com/channel/UC59w9bmROOeUFakVvhMepPQ/',
			icon: (props: any) => (
				<svg fill="currentColor" viewBox="0 0 24 24" {...props}>
					<path
						fillRule="evenodd"
						d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z"
						clipRule="evenodd"
					/>
				</svg>
			),
		},
		{
			name: 'GitHub',
			href: 'https://github.com/byteball',
			icon: (props: any) => (
				<svg fill="currentColor" viewBox="0 0 24 24" {...props}>
					<path
						fillRule="evenodd"
						d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
						clipRule="evenodd"
					/>
				</svg>
			),
		},
	],
}

type subscribeStatusType = "pending" | "success" | "loading" | "error";

export const Footer = () => {
	const [email, setEmail] = useState({ value: "", valid: false });
	const [subscribeStatus, setSubscribeStatus] = useState<subscribeStatusType>("pending");

	const btnRef = useRef<HTMLElement>(null);

	const handleChangeEmail = (ev: any) => {
		const value = String(ev.target.value).trim();

		setEmail({ value, valid: EmailValidator.validate(value) });
	}

	const handleEnter: KeyboardEventHandler<"text"> = (ev) => {
		if (ev.key === "Enter" && btnRef.current) {
			btnRef.current?.click();
		}
	}


	const subscribe = async () => {
		setSubscribeStatus("loading");

		try {
			await fetch('/api/subscribe', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					email: String(email.value)
				}),
			}).then(async res => {
				const resData = await res.json();

				if ("error" in resData) {
					throw new Error(resData.error)
				}

				return resData;
			});

			// setEmail({ value: "", valid: false });

			setSubscribeStatus("success");

		} catch (e: any) {

			setSubscribeStatus("error");
		}

	}

	return <footer className="bg-white z-40" aria-labelledby="footer-heading">
		<h2 id="footer-heading" className="sr-only">
			Footer
		</h2>
		<div className="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8 lg:pt-32">
			<div className="mt-16 sm:mt-20 lg:mt-16 mb-8">More information about Kivach in the <a target="_blank" rel="noopener" href={appConfig.INTRODUCTORY_ARTICLE_URL} className="text-primary">introductory article</a>.</div>
			<div className="border-t border-gray-900/10 pt-8 lg:flex lg:items-center lg:justify-between">
				<div>
					<h3 className="text-sm font-semibold leading-6 text-gray-900">Subscribe to our newsletter</h3>
					<p className="mt-2 text-sm leading-6 text-gray-600">
						The latest news, articles, and resources, sent to your inbox.
					</p>
				</div>
				<div className="sm:max-w-md ">
					<div className="mt-6 sm:flex lg:mt-0">
						<label htmlFor="email-address" className="sr-only">
							Email address
						</label>

						<Input onKeyDown={handleEnter} disabled={subscribeStatus === "loading" || subscribeStatus === "success"} value={email.value} error={email.value && !email.valid ? "Email isn't valid!" : undefined} placeholder="Enter your email" onChange={handleChangeEmail} />

						<div className="mt-4 sm:ml-4 sm:mt-0 sm:flex-shrink-0">
							<Button ref={btnRef} onClick={subscribe} loading={subscribeStatus === "loading"} disabled={!email.value || !email.valid || subscribeStatus === "success"}>Subscribe</Button>
						</div>
					</div>

					<div>
						{subscribeStatus === "success" && <div className="mt-4 text-sm leading-5 text-green-600">You are successfully subscribed. Please confirm your subscription by clicking on the link in the email we sent you.</div>}
						{subscribeStatus === "error" && <div className="mt-4 text-sm leading-5 text-red-600">Error occurred. Please try again later.</div>}
					</div>
				</div>
			</div>
			<div className="mt-8 border-t border-gray-900/10 pt-8 md:flex md:items-center md:justify-between">
				<div className="flex space-x-2 md:space-x-6 md:order-2">
					{navigation.social.map((item) => (
						<a key={item.name} href={item.href} className="text-gray-400 relative hover:text-gray-500">
							<span className="sr-only">{item.name}</span>
							<item.icon className="h-6 w-6" aria-hidden="true" />
						</a>
					))}
				</div>
				<p className="mt-8 text-xs leading-5 text-gray-500 md:order-1 md:mt-0">
					&copy; {(new Date).getFullYear()} <a target="_blank" rel="noopener" href="https://obyte.org">Obyte</a>. All rights reserved. All information about repositories belongs to their owners.
				</p>
			</div>
		</div>
	</footer>
}