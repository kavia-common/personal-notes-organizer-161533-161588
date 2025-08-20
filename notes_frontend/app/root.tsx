import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  Link,
} from "@remix-run/react";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import "./tailwind.css";
import { API_BASE_URL } from "./lib/config";
import { getUserFromRequest } from "./lib/auth.server";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUserFromRequest(request);
  return json({
    env: {
      API_BASE_URL,
    },
    user,
  });
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-full bg-white text-gray-900">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const data = useLoaderData<typeof loader>();
  const apiUnset = !data.env.API_BASE_URL;
  return (
    <div className="min-h-screen">
      {apiUnset ? (
        <div className="w-full bg-yellow-100 text-yellow-900 text-sm px-4 py-2">
          Warning: VITE_API_BASE_URL is not set. Set it in your environment for the app to work properly.
        </div>
      ) : null}
      <header className="flex items-center justify-between border-b px-4 py-3">
        <Link to="/" className="font-semibold text-[#4F8AF4]">
          Notes
        </Link>
        <nav className="text-sm">
          {data.user ? (
            <form method="post" action="/logout">
              <button
                className="rounded border px-3 py-1 text-[#576574] hover:bg-gray-50"
                type="submit"
              >
                Logout
              </button>
            </form>
          ) : (
            <Link
              to="/login"
              className="rounded border px-3 py-1 text-[#576574] hover:bg-gray-50"
            >
              Login
            </Link>
          )}
        </nav>
      </header>
      <Outlet />
    </div>
  );
}
