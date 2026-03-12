"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const role = (formData.get("role") as string) || "CUSTOMER";
  const companyName = formData.get("companyName") as string;
  const businessNumber = formData.get("businessNumber") as string;
  const businessLicenseUrl = formData.get("businessLicenseUrl") as string;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        phone,
        role,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // If company registration, create company record (is_approved defaults to false)
  if (role === "COMPANY" && data.user) {
    const { error: companyError } = await supabase.from("companies").insert({
      user_id: data.user.id,
      company_name: companyName,
      business_number: businessNumber,
      business_license_url: businessLicenseUrl || null,
      representative: name,
      address: "",
      phone: phone || "",
      is_approved: false,
    });

    if (companyError) {
      return { error: companyError.message };
    }

    // Redirect to pending approval page
    redirect("/register/pending");
  }

  redirect("/");
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Check if company user is approved
  if (data.user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (profile?.role === "COMPANY") {
      const { data: company } = await supabase
        .from("companies")
        .select("is_approved")
        .eq("user_id", data.user.id)
        .single();

      if (company && !company.is_approved) {
        await supabase.auth.signOut();
        return { error: "관리자 승인 대기 중입니다. 승인 후 로그인할 수 있습니다." };
      }

      redirect("/partner/dashboard");
    }

    if (profile?.role === "ADMIN") {
      redirect("/admin/dashboard");
    }
  }

  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function signInWithGoogle() {
  const supabase = await createClient();

  const { data } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`,
    },
  });

  if (data.url) {
    redirect(data.url);
  }
}

export async function signInWithKakao() {
  const supabase = await createClient();

  const { data } = await supabase.auth.signInWithOAuth({
    provider: "kakao",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`,
    },
  });

  if (data.url) {
    redirect(data.url);
  }
}
