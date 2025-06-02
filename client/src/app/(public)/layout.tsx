import "@/app/globals.css";
import Navbar from '@/components/Layout/Public/Navbar/page'
import Footer from "@/components/Layout/Public/Footer/page";
import ScrollToTopButton from "@/components/UI/ScrollToTop/page";
import AdminButton from "@/components/UI/AdminButton/page";
import { isAdmin } from "@/lib/auth";

export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const admin = await isAdmin();
  
  return (
    <section>
      <Navbar />
      <main className="mt-[70px]">
        {children}
      </main>
      { admin && <AdminButton />}
      <ScrollToTopButton />
      <Footer />
    </section>
  );
}
