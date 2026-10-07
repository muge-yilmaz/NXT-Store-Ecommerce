import { requireUser } from "@/lib/auth0-utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ecommerce",
  description: "Ecommerce platform",
};

export default async function LoggedInUserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  await requireUser();
  return (
    <div className="container mx-auto max-w-4xl p-4 md:p-8">
      {children}
    </div>
  );
}
