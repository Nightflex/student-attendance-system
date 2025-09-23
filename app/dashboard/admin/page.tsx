"use server"

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { AdminDashboardClient } from "@/components/Admin/AdminDashboardClient"

export default async function AdminDashboardPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')

  console.log(token)
  
  // If no token, redirect to auth
  if (!token) {
    redirect('/auth')
  }
  
  // In a real app, you would validate the token and fetch user data
  const mockUser = {
    id: "1",
    name: "Admin User",
    email: "admin@college.edu",
    role: "admin",
    department: "Administration",
  }
  
  return <AdminDashboardClient user={mockUser} />
}