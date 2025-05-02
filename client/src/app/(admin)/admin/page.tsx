import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Dashboard",
    icons: {
      icon: { url: "/favicon.ico", type: "image/x-icon" },
    },
  };

export default function Admin() {
    return (
        <>Home</>
    )
}