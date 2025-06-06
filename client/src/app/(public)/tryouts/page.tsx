import { Metadata } from "next";
import TryoutForm from "@/components/Form/TryoutForm/page";

export const metadata: Metadata = {
    title: 'Tryouts',
};

export default function Tryouts() {
    return (
        <>
            <TryoutForm/>
        </>
    )}