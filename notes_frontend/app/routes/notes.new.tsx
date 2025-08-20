import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { requireUser } from "../lib/auth.server";
import { apiFetch } from "../lib/api";

export async function action({ request }: ActionFunctionArgs) {
  await requireUser(request);
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }
  const created = await apiFetch<{ id: string }>("/notes", {
    method: "POST",
    body: JSON.stringify({ title: "Untitled", content: "" }),
  });
  return redirect(`/notes/${created.id}`);
}

export default function NewNoteAction() {
  return null;
}
