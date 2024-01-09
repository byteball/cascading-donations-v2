"use server";

import Link from 'next/link';

const faqs = [
  {
    question: "What coins are accepted for donations?",
    answer:
      <p>All Obyte tokens and tokens on other chains (Ethereum, BSC, Polygon) that are exportable to Obyte through <a href="https://counterstake.org" className='text-primary' target="_blank" rel="noopener">Counterstake Bridge</a>. This includes many popular tokens such as USDC, ETH, WBTC, BNB, etc.</p>
  },
  {
    question: "Can I donate with a credit card?",
    answer:
      <p>Not directly but you can buy any of the supported crypto tokens with credit card through any of the existing fiat on-ramps and then donate those crypto tokens.</p>
  },
  {
    question: "Can I donate to any github repo even if their owner didn't set up anything on Kivach?",
    answer: <p>Yes, you can donate to any of the 28 million public repositories on github. Your money will wait for the owner to prove ownership of their github account and claim the money (and optionally share it with other repos). The money will be stored on an <a href="https://obyte.org/platform/autonomous-agents" className='text-primary' target="_blank" rel="noopener">Autonomous Agent</a> that underpins the whole cascading donations system, and nobody else will be able to take the money.</p>
  },
  {
    question: "I'm a developer and noticed that some people have already donated to one of my repos. How do I claim the funds?",
    answer: <p>Use the <Link href="/settings" className='text-primary'>Add repository</Link> link. You'll need to install <a href="https://obyte.org" className='text-primary' target="_blank" rel="noopener">Obyte wallet</a> if you don't already have one and do github attestation (find the Github Attestation bot in the Bot Store in the wallet) to link your github account. Then, you set up the distribution rules and trigger the first distribution to claim the funds.</p>
  },
  {
    question: "I'm a developer and looking to receive donations. Are there any requirements as to what share of donations should be forwarded and to what repos?",
    answer: <p>There are no requirements, it's totally up to you. You can keep 100% of donations for yourself if you like, or, on the other extreme, you can choose to forward 100% to other repos and leave nothing for yourself. We recommend forwarding some share of donations to other open-source projects that are critical for your project and made it possible. The donors will see your distribution rules and we expect that they will be more willing to donate when they see that they can help more than one project and you are also a donor (in a way).</p>
  },
  {
    question: "Are Kivach donations tax deductible?",
    answer: <p>You'd better consult a tax lawyer in your jurisdiction but to the best of our knowledge, they are not. Normally, tax exempt status is granted to certain entities that are registered and supervised by the respective government bodies. Kivach, on the other hand, exists in a decentralized space and can't enjoy such a status. This means that any donations you make on Kivach, you make them out of your (or your company's) <i>net</i> income and can't use them to reduce your taxes.</p>
  },
  {
    question: "Why github only?",
    answer: <div>
      <p className='mb-2'>It's quite common in open-source software that one project heavily depends on a few other open-source projects, which in turn depend on yet other open-source projects, and so on. This makes it natural to want to reward all layers of development that contributed to the final user-facing app, and Kivach makes this possible by automatically cascading donations down the technical stack.</p>
      <p>That said, the same concept can of course be used in any other industries where the recipients of donations feel a need to share with other contributors who made their work possible. Kivach itself is <a href="https://github.com/byteball/cascading-donations-ui" className='text-primary' target="_blank" rel="noopener">open-source</a> and one can fork it to help creators in any other fields to be rewarded.</p>
    </div>
  },
  {
    question: "Why the name Kivach?",
    answer: <p>The cascading donations service is named so after a <a href="https://en.wikipedia.org/wiki/Kivach_Falls" className='text-primary' target="_blank" rel="noopener">cascading waterfall in Karelia</a>.</p>
  }
];

export const FaqList = () => (<div className="mt-10 space-y-6 divide-y divide-gray-900/10">
  {faqs.map((faq) => (
    <div key={faq.question} className="pt-6">
      <div>
        <div className="flex w-full items-start justify-between text-left text-gray-900">
          <h2 className="text-lg font-semibold leading-7 max-w-3xl">{faq.question}</h2>
        </div>
      </div>
      <div className="mt-2 pr-12 max-w-4xl">
        <div className="text-base leading-7 text-gray-600">{faq.answer}</div>
      </div>
    </div>
  ))}
</div>);