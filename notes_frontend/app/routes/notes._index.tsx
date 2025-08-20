import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Form,
  NavLink,
  Outlet,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import { requireUser } from "../lib/auth.server";
import { apiFetch } from "../lib/api";
import type { Note } from "../lib/types";
import { useEffect, useState } from "react";

type LoaderData = {
  notes: Note[];
  q: string;
};

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUser(request);
  const url = new URL(request.url);
  const q = url.searchParams.get("q") || "";
  const search = q ? `?q=${encodeURIComponent(q)}` : "";
  const notes = await apiFetch<Note[]>(`/notes${search}`);
  return json<LoaderData>({ notes, q });
}

export default function NotesLayout() {
  const { notes, q } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const submit = useSubmit();
  const [query, setQuery] = useState(q);

  const isSearching =
    navigation.state === "loading" &&
    new URL(navigation.location?.search || "").searchParams.has("q");

  useEffect(() => {
    const id = setTimeout(() => {
      if (query !== q) {
        const form = new FormData();
        form.set("q", query);
        submit(form, { method: "GET" });
      }
    }, 300);
    return () => clearTimeout(id);
  }, [query, q, submit]);

  return (
    <div className="grid h-[calc(100vh-57px)] grid-cols-[320px_1fr]">
      <aside className="border-r p-3">
        <div className="mb-3 flex gap-2">
          <Form method="get" className="flex-1">
            <input
              name="q"
              aria-label="Search notes"
              placeholder="Search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded border px-3 py-2 text-sm outline-[#4F8AF4]"
            />
          </Form>
          <Form method="post" action="/notes/new">
            <button
              type="submit"
              className="rounded bg-[#4F8AF4] px-3 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              New
            </button>
          </Form>
        </div>
        <div className="text-xs text-gray-500 mb-2">
          {isSearching ? "Searching..." : `${notes.length} note(s)`}
        </div>
        <nav className="flex flex-col gap-1 overflow-auto">
          {notes.map((n) => (
            <NavLink
              key={n.id}
              to={`/notes/${n.id}`}
              className={({ isActive }) =>
                `rounded px-3 py-2 text-sm hover:bg-gray-50 ${
                  isActive ? "bg-gray-100 text-[#576574]" : "text-gray-800"
                }`
              }
            >
              <div className="truncate font-medium">{n.title || "Untitled"}</div>
              <div className="truncate text-xs text-gray-500">
                {new Date(n.updatedAt || n.createdAt).toLocaleString()}
              </div>
            </NavLink>
          ))}
          {notes.length === 0 && (
            <div className="text-sm text-gray-500 px-2">No notes yet.</div>
          )}
        </nav>
      </aside>
      <main className="overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
