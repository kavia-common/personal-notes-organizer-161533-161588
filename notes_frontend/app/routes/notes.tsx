import type { LoaderFunctionArgs } from "@remix-run/node";
import { requireUser } from "../lib/auth.server";
import { Outlet } from "@remix-run/react";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUser(request);
  return null;
}

export default function NotesPage() {
  return <Outlet />;
}
