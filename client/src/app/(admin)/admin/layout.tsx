import type { Metadata } from "next";
import "../../globals.css";

import AdminNavbar from "../../../components/Layout/AdminNavbar/page";

export const metadata: Metadata = {
  title: "Admin",
  icons: {
    icon: { url: "/favicon.ico", type: "image/x-icon" },
  },
};

export default function Admin({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AdminNavbar content={children} />
  );
}
