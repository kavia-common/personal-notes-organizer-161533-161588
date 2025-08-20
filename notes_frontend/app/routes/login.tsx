import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useNavigation } from "@remix-run/react";
import { getUserFromRequest } from "../lib/auth.server";
import { apiFetch } from "../lib/api";

type ActionData = { error?: string };

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUserFromRequest(request);
  if (user) return redirect("/notes");
  return json({});
}

export async function action({ request }: ActionFunctionArgs) {
  const form = await request.formData();
  const email = String(form.get("email") || "");
  const password = String(form.get("password") || "");
  try {
    // Expect backend to set auth cookie on success.
    await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    return redirect("/notes");
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Login failed";
    return json<ActionData>({ error: message }, { status: 400 });
  }
}

export default function Login() {
  const actionData = useActionData<ActionData>();
  const nav = useNavigation();
  const busy = nav.state === "submitting";
  const emailId = "email";
  const passwordId = "password";
  return (
    <div className="mx-auto mt-16 max-w-md rounded border p-6">
      <h1 className="mb-4 text-xl font-semibold text-[#576574]">Login</h1>
      {actionData?.error ? (
        <div className="mb-3 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {actionData.error}
        </div>
      ) : null}
      <Form method="post" className="space-y-3" noValidate>
        <div>
          <label htmlFor={emailId} className="mb-1 block text-sm text-gray-700">Email</label>
          <input
            id={emailId}
            name="email"
            type="email"
            required
            className="w-full rounded border px-3 py-2 text-sm outline-[#4F8AF4]"
          />
        </div>
        <div>
          <label htmlFor={passwordId} className="mb-1 block text-sm text-gray-700">Password</label>
          <input
            id={passwordId}
            name="password"
            type="password"
            required
            className="w-full rounded border px-3 py-2 text-sm outline-[#4F8AF4]"
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded bg-[#FF9800] px-3 py-2 text-white hover:opacity-90 disabled:opacity-60"
        >
          {busy ? "Signing in..." : "Sign in"}
        </button>
      </Form>
      <div className="mt-3 text-right">
        <Link to="/signup" className="text-sm text-[#4F8AF4] hover:underline">
          Create account
        </Link>
      </div>
    </div>
  );
}
