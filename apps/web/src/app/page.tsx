// src/app/page.tsx
import { redirect } from "next/navigation";

export default function Page() {
  redirect("/dashboard"); // 또는 "/training/datasets" 등
}