"use client";

import { ReactNode } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <html>
        <body>
          <main>{children}</main>
        </body>
      </html>
    </div>
  );
}
