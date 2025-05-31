import "@/app/globals.css";
import Navbar from '@/components/Layout/Public/Navbar/page'
import Footer from "@/components/Layout/Public/Footer/page";
import ScrollToTopButton from "@/components/UI/ScrollToTop/page";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <section>
      <Navbar />
      <main className="mt-[70px]">
        {children}
      </main>
      <ScrollToTopButton />
      <Footer />
    </section>
  );
}
