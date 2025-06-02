import { Metadata } from "next";
import TryoutForm from "../../../components/TryoutForm/page";

export const metadata: Metadata = {
    title: 'Team',
};

export default function Team() {
    return (
        <>
            <TryoutForm/>
        </>
    )}