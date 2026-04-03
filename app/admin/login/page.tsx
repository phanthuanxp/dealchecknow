import { AuthError } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth, signIn } from "@/lib/auth";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

const errorMap: Record<string, string> = {
  missing_fields: "Vui lòng nhập đầy đủ email và mật khẩu.",
  CredentialsSignin: "Email hoặc mật khẩu không đúng.",
  AuthError: "Đăng nhập thất bại. Vui lòng thử lại.",
  CallbackRouteError: "Phiên đăng nhập không hợp lệ. Vui lòng thử lại."
};

function resolveErrorMessage(errorCode?: string) {
  if (!errorCode) {
    return "";
  }

  return errorMap[errorCode] ?? "Đã có lỗi xảy ra. Vui lòng thử lại.";
}

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  const session = await auth();
  if (session?.user) {
    redirect("/admincp");
  }

  const params = await searchParams;
  const errorMessage = resolveErrorMessage(params.error);

  async function loginAction(formData: FormData) {
    "use server";

    const email = String(formData.get("email") ?? "").toLowerCase().trim();
    const password = String(formData.get("password") ?? "");

    if (!email || !password) {
      redirect("/admincp/login?error=missing_fields");
    }

    try {
      await signIn("credentials", {
        email,
        password,
        redirectTo: "/admincp"
      });
    } catch (error) {
      if (error instanceof AuthError) {
        if (error.type === "CredentialsSignin") {
          redirect("/admincp/login?error=CredentialsSignin");
        }

        redirect(`/admincp/login?error=${error.type}`);
      }

      throw error;
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="mb-2 text-sm font-semibold text-teal-700">Taxi Ninh Bình - AdminCP</p>
        <h1 className="text-2xl font-bold text-slate-900">Đăng nhập quản trị</h1>
        <p className="mt-2 text-sm text-slate-600">
          Vui lòng đăng nhập bằng tài khoản quản trị để truy cập AdminCP.
        </p>

        {errorMessage ? (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}

        <form action={loginAction} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
              placeholder="admin@taxininhbinh.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
              Mật khẩu
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800"
          >
            Đăng nhập
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-500">
          Quay về trang chủ:{" "}
          <Link href="/" className="font-medium text-teal-700 hover:underline">
            taxininhbinh.com
          </Link>
        </p>
      </section>
    </main>
  );
}
