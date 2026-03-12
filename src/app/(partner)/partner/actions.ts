"use server";

import { createClient } from "@/lib/supabase/server";

export async function updateCompanyProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const companyName = formData.get("companyName") as string;
  const description = formData.get("description") as string;
  const address = formData.get("address") as string;
  const phone = formData.get("phone") as string;
  const specialties = JSON.parse(formData.get("specialties") as string || "[]");
  const serviceAreas = JSON.parse(formData.get("serviceAreas") as string || "[]");

  const { error } = await supabase
    .from("companies")
    .update({
      company_name: companyName,
      description,
      address,
      phone,
      specialties,
      service_areas: serviceAreas,
    })
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  return { success: true };
}
