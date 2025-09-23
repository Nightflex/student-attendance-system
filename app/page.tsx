"use server";

import { LandingPage } from "@/components/Home/LandingPage";
import { TestTeacher } from "@/lib/auth/login";
import bcrypt from "bcryptjs";

export default async function HomePage() {
  return <LandingPage />;
}
