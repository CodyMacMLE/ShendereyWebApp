import RegistrationLayout from '@/components/Layout/Public/RegistrationLayout/page';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Register',
};

export default function Register() {

  return (
    <RegistrationLayout />
  )
}
