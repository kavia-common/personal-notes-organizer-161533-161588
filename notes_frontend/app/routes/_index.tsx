import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { requireUser } from "../lib/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    await requireUser(request);
    return redirect("/notes");
  } catch {
    return redirect("/login");
  }
}
export default function Index() {
  return null;
}
