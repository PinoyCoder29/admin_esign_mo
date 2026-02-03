"use client";
import AdminHeader from "@/components/header/adminHeader";
import { ReactNode } from "react";

export default function layout({ children }: { children: ReactNode }) {
  return (
    <div>
      <AdminHeader />
      <main>{children}</main>
    </div>
  );
}
