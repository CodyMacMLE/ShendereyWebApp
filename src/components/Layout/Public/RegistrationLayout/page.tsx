import Image from "next/image";
import Link from "next/link";
import { getRegistrationPolicies, getRegistrationImages } from "@/lib/actions";

export default async function RegistrationLayout() {
    const policies = await getRegistrationPolicies();
    const registrationImages = await getRegistrationImages();

    // Filter to only images that have a slot and imageUrl
    const visibleImages = registrationImages.filter(img => img.slot && img.imageUrl);

    // Sort in a consistent order: current, next, camp
    const slotOrder = ['current', 'next', 'camp'];
    visibleImages.sort((a, b) => {
        const aIndex = slotOrder.indexOf(a.slot!);
        const bIndex = slotOrder.indexOf(b.slot!);
        return aIndex - bIndex;
    });


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

            {/* Schedule Images */}
            {visibleImages.map((img) => {
                const url = img.imageUrl!;
                const isPdf = url.split('?')[0].toLowerCase().endsWith('.pdf');
                return (
                    <div key={img.id}>
                        {/* Schedule Title */}
                        <div className="mx-auto max-w-2xl lg:mx-0 mt-10">
                          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-900 sm:text-2xl">{img.title || 'Schedule'}</h2>
                        </div>

                        {/* Schedule File */}
                        <div className="mt-6 flex justify-center">
                            {isPdf ? (
                                <div className="w-full max-w-4xl">
                                    <iframe
                                        src={url}
                                        title={img.title || 'Schedule'}
                                        className="w-full h-[80vh] rounded-lg border border-[var(--border)]"
                                        loading="lazy"
                                    />
                                    <a
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-3 inline-block text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-hover)]"
                                    >
                                        Open PDF in new tab
                                    </a>
                                </div>
                            ) : (
                                <Image
                                    src={url}
                                    alt={img.title || 'Schedule'}
                                    width={1200}
                                    height={800}
                                    className="w-full h-auto max-w-4xl rounded-lg border border-[var(--border)]"
                                    loading="lazy"
                                    quality={85}
                                />
                            )}
                        </div>
                    </div>
                );
            })}

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
