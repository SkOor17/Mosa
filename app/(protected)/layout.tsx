import { getUser } from "@/src/lib/auth-session";
import { redirect } from "next/navigation";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUser()
  if (!user) {
    redirect('/?session_invalid=true');
  }

  return (
    <div className="py-6 px-4">
        {children}
    </div>
  );
}
