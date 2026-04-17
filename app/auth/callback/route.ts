import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const returnTo = searchParams.get("returnTo") || "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Get user profile to determine redirect
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single<{ role: string }>();

        // Redirect based on role
        if (profile?.role === "admin" || profile?.role === "instructor") {
          const forwardedHost = request.headers.get("x-forwarded-host");
          const isLocalEnv = process.env.NODE_ENV === "development";

          if (isLocalEnv) {
            return NextResponse.redirect(`${origin}/admin`);
          } else if (forwardedHost) {
            return NextResponse.redirect(`https://${forwardedHost}/admin`);
          } else {
            return NextResponse.redirect(`${origin}/admin`);
          }
        }
      }

      // Default redirect for students
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${returnTo}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(
          `https://${forwardedHost}${returnTo}`
        );
      } else {
        return NextResponse.redirect(`${origin}${returnTo}`);
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/?error=auth`);
}
