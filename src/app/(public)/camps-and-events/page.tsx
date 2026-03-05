import CampsEventsLayout from '@/components/Layout/Public/CampsEventsLayout/page';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Camps & Events',
    description: 'Register for gymnastics camps and birthday parties at Shenderey Gymnastics Centre in Newmarket, Ontario. Open to all ages and skill levels.',
    openGraph: {
        title: 'Camps & Events | Shenderey Gymnastics',
        description: 'Sign up for gymnastics camps and birthday parties at Shenderey Gymnastics Centre in Newmarket, Ontario.',
        type: 'website',
    },
};

export default function CampsEvents() {
    return <CampsEventsLayout />;
}
