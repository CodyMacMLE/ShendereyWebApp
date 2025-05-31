import type { Metadata } from "next";
import "../../globals.css";

import AdminNavbar from "../../../components/Layout/Admin/AdminNavbar/page";

import {getKindeServerSession} from "@kinde-oss/kinde-auth-nextjs/server";
import {redirect} from "next/navigation";

export const metadata: Metadata = {
  title: "Admin",
  icons: {
    icon: { url: "/favicon.ico", type: "image/x-icon" },
  },
};

export default async function Admin({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const {isAuthenticated} = getKindeServerSession();

  if (!(await isAuthenticated())) {
    redirect("/api/auth/login?post_login_redirect_url=/login");
  }

  return (
    <AdminNavbar content={children} />
  );
}
