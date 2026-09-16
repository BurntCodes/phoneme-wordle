import type { Metadata } from "next";
import ManagePage from "@/components/manage/ManagePage";

export const metadata: Metadata = { title: "Manage" };

export default function Page() {
  return <ManagePage />;
}
