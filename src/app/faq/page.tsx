import { Metadata } from 'next';

import { Title } from '@/components';

import { FaqList } from './_FaqList';

export const metadata: Metadata = {
  title: 'Kivach - F.A.Q.',
  description: 'Cascading donations to github repositories. Support open-source projects with donations in crypto, and they will automatically forward a part of your donation to other open-source projects that made them possible.',
  openGraph: {
    images: ["/og/faq.png"]
  }
}

export default () => (
<div className="mt-24">
  <div className="mx-auto divide-y divide-gray-900/10 isolate relative">
    <Title level={1}>Frequently asked <br />questions</Title>

    <div
      className="absolute left-1/3 right-0 top-0 -z-10 -ml-24 transform-gpu overflow-hidden blur-3xl lg:ml-24 xl:ml-48"
      aria-hidden="true"
    >
      <div
        className="aspect-[801/1036] w-[50.0625rem] bg-gradient-to-tr from-primary to-[#9089fc] opacity-20"
        style={{
          clipPath:
            'polygon(63.1% 29.5%, 100% 17.1%, 76.6% 3%, 48.4% 0%, 44.6% 4.7%, 54.5% 25.3%, 59.8% 49%, 55.2% 57.8%, 44.4% 57.2%, 27.8% 47.9%, 35.1% 81.5%, 0% 97.7%, 39.2% 100%, 35.2% 81.4%, 97.2% 52.8%, 63.1% 29.5%)',
        }}
      />
    </div>

    <FaqList />
  </div>
</div>
)
