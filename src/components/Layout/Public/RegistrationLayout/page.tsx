import SessionCarousel from "@/components/UI/SessionCarousel/SessionCarousel";
import { getRegistrationImages, getRegistrationPolicies } from "@/lib/actions";
import Link from "next/link";

export default async function RegistrationLayout() {
    const policies = await getRegistrationPolicies();
    const registrationImages = await getRegistrationImages();

    // Separate into session images and camp images.
    // Supports legacy slot values ('current', 'next') alongside the new 'session' value.
    const sessionImages = registrationImages
        .filter(img => img.imageUrl && (img.slot === 'session' || img.slot === 'current' || img.slot === 'next'))
        .sort((a, b) => a.id - b.id)
        .map(img => ({ id: img.id, imageUrl: img.imageUrl!, title: img.title ?? null, slot: img.slot ?? null }));


    return (
        <div className="px-4 pb-5 sm:px-6 lg:px-8 pt-20 bg-white">
        <div className="bg-white py-24 sm:py-0">


          <div className="mx-auto max-w-7xl px-6 lg:px-8">

            {/* Register Title */}
            <div className="mx-auto max-w-2xl lg:mx-0">
              <p className="text-base/7 font-semibold text-[var(--primary)]">Register Now</p>
              <h2 className="mt-2 text-5xl font-semibold tracking-tight text-gray-900 sm:text-7xl">Sign up with us today</h2>
            </div>

            {/* Registration Cards */}
            <div className="mt-8 flex justify-center">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 max-w-4xl w-full">
                {/* New Member Card */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 transition-shadow flex flex-col h-full">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">New Member</h3>
                  <p className="text-sm text-gray-600 mb-4 flex-grow">
                    New to the gym? Click the button below to sign up with us today.
                  </p>
                  <Link
                    href="https://shenderey-gymnastics-centre-newmarket.gymdesk.com/signup"
                    target="_blank"
                    className="inline-block bg-[var(--primary)] text-white px-4 py-2 rounded-md hover:bg-[var(--primary-hover)] cursor-pointer text-sm font-medium self-start"
                  >
                    New Member Sign Up
                  </Link>
                </div>

                {/* Returning Member Card */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 transition-shadow flex flex-col h-full">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Returning Member</h3>
                  <p className="text-sm text-gray-600 mb-4 flex-grow">
                    Email us at <a href="mailto:sgcrecreational@gmail.com" className="text-[var(--primary)] hover:text-[var(--primary-hover)] underline">sgcrecreational@gmail.com</a> to register.
                  </p>
                  <Link
                    href="mailto:sgcrecreational@gmail.com"
                    target="_blank"
                    className="inline-block bg-[var(--primary)] text-white px-4 py-2 rounded-md hover:bg-[var(--primary-hover)] cursor-pointer text-sm font-medium self-start"
                  >
                    Email Us
                  </Link>
                </div>
              </div>
            </div>

            {/* Recreational Sessions Carousel */}
            {sessionImages.length > 0 && (
                <SessionCarousel images={sessionImages} title="Recreational Sessions" />
            )}

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
                      key={policy.id}
                      className='mt-2'
                    >
                        {policy.policy}
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
