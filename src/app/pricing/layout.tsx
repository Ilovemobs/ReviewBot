import { getSession, refreshUserFromDb } from "@/lib/auth";
import Navbar from "@/components/navbar";

export default async function PricingLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  let user = null;
  if (session) {
    user = await refreshUserFromDb(session);
  }

  return (
    <>
      <Navbar user={user} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </>
  );
}
