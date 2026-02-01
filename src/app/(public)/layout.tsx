import "@/app/globals.css";
import AnnouncementBanner from "@/components/Layout/Public/AnnouncementBanner/page";
import Footer from "@/components/Layout/Public/Footer/page";
import Navbar from '@/components/Layout/Public/Navbar/page';
import AdminButton from "@/components/UI/AdminButton/page";
import ScrollToTopButton from "@/components/UI/ScrollToTop/page";
import { isAdmin } from "@/lib/auth";
import { getActiveAnnouncement } from "@/lib/actions";

export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const admin = await isAdmin();
  const activeAnnouncement = await getActiveAnnouncement();
  const hasBanner = !!activeAnnouncement;

  return (
    <section>
      {hasBanner && <AnnouncementBanner announcement={activeAnnouncement} />}
      <Navbar topOffset={hasBanner ? 40 : 0} />
      <main className={`${hasBanner ? 'mt-[110px]' : 'mt-[70px]'} bg-white`}>
        {children}
      </main>
      { admin && <AdminButton />}
      <ScrollToTopButton />
      <Footer />
    </section>
  );
}
