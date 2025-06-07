import { Metadata } from 'next';

import { policies } from '@/public/files/registrationPolicies';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Register',
};

export default function Register() {

  return (
    <div className="px-4 pb-5 sm:px-6 lg:px-8 pt-20 bg-white">
      <div className="bg-white py-24 sm:py-0">

        
        <div className="mx-auto max-w-7xl px-6 lg:px-8">

          {/* Register Title */}
          <div className="mx-auto max-w-2xl lg:mx-0">
            <p className="text-base/7 font-semibold text-[var(--primary)]">Register Now</p>
            <h2 className="mt-2 text-5xl font-semibold tracking-tight text-gray-900 sm:text-7xl">Sign up with us today</h2>
            <p className="mt-8 text-pretty text-lg font-medium text-gray-500 sm:text-xl/8">
              New to the gym? Click the button below to sign up with us today.
            </p>
            <div className="mt-8">
              <Link href="https://shenderey-gymnastics-centre-newmarket.gymdesk.com/signup" target="_blank" className="bg-[var(--primary)] text-white px-4 py-2 rounded-md hover:bg-[var(--primary-hover)] cursor-pointer">
                Sign Up
              </Link>
            </div>
          </div>
        
          {/* Schedule */}
          <div className="mt-20 ">
            <div className="gymdesk-frame-container">
              <iframe
              src="https://gymdesk.com/widgets/schedule/render/gym/lWdgJ"
              style={{ width: '100%', height: '100%', minHeight: '275px' }}
            />
            </div>
          </div>

          {/* Policies Title */}
          <div className="mt-16 sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h1 className="text-xl font-semibold text-gray-900">Policies</h1>
            </div>
          </div>

          {/* Policies */}
          <div className="mt-8 overflow-hidden bg-[var(--background)] shadow ring-1 ring-black/5 sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <ol className='pl-3 list-disc'>
                {policies.map(policy => (
                  <li 
                    key={policy.idx}
                    className='mt-2'
                  >
                      {policy.string}
                  </li>
                ))}
              </ol>
            </div>
          </div>

      </div>
      </div>
    </div>
  )
}
