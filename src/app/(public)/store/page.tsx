import { getProducts } from "@/lib/actions";
import { Metadata } from "next";
import StoreGrid from "./StoreGrid";

export const metadata: Metadata = {
    title: 'Store',
};

export default async function Store() {
    const products = await getProducts();

    return (
        <div className="px-4 pb-5 sm:px-6 lg:px-8 pt-20 bg-white">
            {/* Header */}
            <div className="bg-white pt-5 sm:pt-10">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <p className="text-base/7 font-semibold text-[var(--primary)]">Our Store</p>
                        <h1 className="mt-2 text-pretty text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
                            Shenderey Spirit Wear
                        </h1>
                        <p className="mt-6 text-lg/8 text-gray-600">
                            Browse our collection of Shenderey Gymnastics merchandise. Show your team spirit with our apparel and accessories.
                        </p>
                    </div>

                    {/* Order Info */}
                    <div className="mx-auto max-w-2xl mt-8 rounded-lg bg-gray-50 border border-gray-200 px-6 py-5 text-center">
                        <p className="text-sm/6 text-gray-700">
                            To place an order for spirit wear, please contact us at{' '}
                            <a href="mailto:shendereycomp@gmail.com" className="font-semibold text-[var(--primary)] hover:underline">
                                shendereycomp@gmail.com
                            </a>
                        </p>
                    </div>
                </div>
            </div>

            {/* Product Grid */}
            <div className="bg-white py-10 sm:py-16">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <StoreGrid products={products} />
                </div>
            </div>
        </div>
    );
}
