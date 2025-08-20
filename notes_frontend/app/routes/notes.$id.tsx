import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  useLoaderData,
  useNavigation,
  useParams,
  useSubmit,
} from "@remix-run/react";
import { requireUser } from "../lib/auth.server";
import { apiFetch } from "../lib/api";
import type { Note } from "../lib/types";
import { useEffect, useState } from "react";

type LoaderData = { note: Note };

export async function loader({ params, request }: LoaderFunctionArgs) {
  await requireUser(request);
  const { id } = params;
  if (!id) throw new Response("Not Found", { status: 404 });
  const note = await apiFetch<Note>(`/notes/${id}`);
  return json<LoaderData>({ note });
}

export async function action({ request, params }: ActionFunctionArgs) {
  await requireUser(request);
  const { id } = params;
  if (!id) throw new Response("Not Found", { status: 404 });

  if (request.method === "POST" || request.method === "PUT" || request.method === "PATCH") {
    const form = await request.formData();
    const title = String(form.get("title") || "");
    const content = String(form.get("content") || "");
    await apiFetch(`/notes/${id}`, {
      method: "PUT",
      body: JSON.stringify({ title, content }),
    });
    return redirect(`/notes/${id}`);
  }
  if (request.method === "DELETE") {
    await apiFetch(`/notes/${id}`, { method: "DELETE" });
    return redirect("/notes");
  }
  return json({ error: "Method not allowed" }, { status: 405 });
}

export default function NoteDetails() {
  const { note } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const submit = useSubmit();
  const params = useParams();

  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
  }, [params.id, note.title, note.content]);

  const isSaving =
    navigation.formAction?.endsWith(`/notes/${note.id}`) &&
    (navigation.state === "submitting" || navigation.state === "loading");

  return (
    <div className="mx-auto max-w-3xl">
      <Form
        method="post"
        className="space-y-4"
        onChange={(e) => {
          const form = e.currentTarget;
          const fd = new FormData(form);
          // Debounced auto-save using WeakMap to avoid any casts
          const key = "__t";
          const w = form as unknown as Record<string, unknown>;
          if (typeof w[key] === "number") {
            window.clearTimeout(w[key] as number);
          }
          w[key] = window.setTimeout(() => {
            submit(fd, { method: "post" });
          }, 500);
        }}
      >
        <div className="flex items-center justify-between">
          <input
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full rounded border px-3 py-2 text-lg font-medium outline-[#4F8AF4]"
          />
          <Form method="delete">
            <button
              type="submit"
              className="ml-3 rounded border border-red-300 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              Delete
            </button>
          </Form>
        </div>
        <textarea
          name="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your note..."
          rows={18}
          className="w-full rounded border px-3 py-2 text-sm outline-[#4F8AF4]"
        />
        <div className="text-xs text-gray-500">
          {isSaving ? "Saving..." : "Saved"}
        </div>
      </Form>
    </div>
  );
}
