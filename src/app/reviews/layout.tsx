import { getSession, refreshUserFromDb } from "@/lib/auth";
import Navbar from "@/components/navbar";
import { redirect } from "next/navigation";

export default async function ReviewsLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/");

  const fresh = await refreshUserFromDb(session);

  return (
    <>
      <Navbar user={fresh} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </>
  );
}
