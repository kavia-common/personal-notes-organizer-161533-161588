import { redirect } from "@remix-run/node";
import { apiFetch } from "../lib/api";

export async function action() {
  try {
    await apiFetch("/auth/logout", { method: "POST" });
  } catch {
    // ignore
  }
  return redirect("/login");
}

export default function Logout() {
  return null;
}
