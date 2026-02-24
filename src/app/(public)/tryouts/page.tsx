import { Metadata } from "next";
import TryoutForm from "@/components/Form/TryoutForm/page";

export const metadata: Metadata = {
    title: 'Competitive Tryouts',
    description: 'Sign up for Shenderey Gymnastics competitive tryouts in Newmarket, Ontario. Join a program that has developed provincial, national, and NCAA-scholarship gymnasts.',
    openGraph: {
        title: 'Competitive Tryouts | Shenderey Gymnastics',
        description: 'Sign up for competitive gymnastics tryouts at Shenderey Gymnastics Centre in Newmarket, Ontario — developing provincial, national, and scholarship gymnasts since 1984.',
        type: 'website',
    },
};

export default function Tryouts() {
    return (
        <>
            <TryoutForm/>
        </>
    )}