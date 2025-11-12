import AdminHeader from "@/components/header/adminHeader";
import { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <html>
        <body>
          <AdminHeader />
          <main>{children} </main>
        </body>
      </html>
    </div>
  );
}
