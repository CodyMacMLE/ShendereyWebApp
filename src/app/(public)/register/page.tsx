import RegistrationLayout from '@/components/Layout/Public/RegistrationLayout/page';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Register for Recreational Classes',
  description: 'Register your child for recreational gymnastics classes at Shenderey Gymnastics Centre in Newmarket, Ontario. Programs available for all ages and skill levels.',
  openGraph: {
    title: 'Register for Recreational Classes | Shenderey Gymnastics',
    description: 'Register for recreational gymnastics classes at Shenderey Gymnastics Centre in Newmarket, Ontario. All ages and skill levels welcome.',
    type: 'website',
  },
};

export default function Register() {

  return (
    <RegistrationLayout />
  )
}
