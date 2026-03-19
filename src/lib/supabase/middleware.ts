import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const protectedPrefixes = ["/mypage", "/partner", "/admin"];
const protectedExactPaths = ["/community/write", "/reviews/write"];
const authRoutes = ["/login", "/register"];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Redirect unauthenticated users away from protected routes
  if (
    !user &&
    (protectedPrefixes.some((prefix) => pathname.startsWith(prefix)) ||
     protectedExactPaths.some((path) => pathname.startsWith(path)))
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from auth routes
  if (user && authRoutes.some((route) => pathname.startsWith(route))) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // RBAC: Role-based access control for protected routes
  if (user && protectedPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role;
    const redirectHome = () => {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    };

    // /admin/* → ADMIN only
    if (pathname.startsWith("/admin") && role !== "ADMIN") {
      return redirectHome();
    }

    // /partner/* → COMPANY or ADMIN only
    if (pathname.startsWith("/partner") && role !== "COMPANY" && role !== "ADMIN") {
      return redirectHome();
    }

    // /mypage/* → CUSTOMER or ADMIN only
    if (pathname.startsWith("/mypage") && role !== "CUSTOMER" && role !== "ADMIN") {
      return redirectHome();
    }

    // OAuth 사용자 전화번호 미입력 시 설정 페이지로 강제 이동
    if (role === "CUSTOMER" && !pathname.startsWith("/mypage/settings")) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("phone")
        .eq("id", user.id)
        .single();

      // provider가 OAuth(email이 아닌)이고 전화번호 없으면 리다이렉트
      const providers = user.app_metadata?.providers as string[] | undefined;
      const isOAuth = providers?.some((p: string) => p !== "email");
      if (isOAuth && !profileData?.phone) {
        const url = request.nextUrl.clone();
        url.pathname = "/mypage/settings";
        url.searchParams.set("require_phone", "true");
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}
