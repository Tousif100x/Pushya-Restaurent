import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { InstallPrompt } from "@/components/layout/InstallPrompt";
import { NetworkStatus } from "@/components/layout/NetworkStatus";
import { BackToTop } from "@/components/layout/BackToTop";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-full">
      <Header />
      <main className="flex-1 pt-16 md:pt-20">
        {children}
      </main>
      <Footer />
      <InstallPrompt />
      <NetworkStatus />
      <BackToTop />
    </div>
  );
}
