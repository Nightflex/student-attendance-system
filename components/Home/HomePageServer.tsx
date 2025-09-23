import { LandingPage } from "@/components/Home/LandingPage"
import { AuthForms } from "@/components/Auth/AuthForm"
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function HomePageServer() {
  const cookieStore = cookies()
  const token = (await cookieStore).get('auth-token')
  
  // If user is authenticated, redirect to dashboard
  if (token) {
    redirect('/dashboard/student')
  }
  
  // Show landing page for unauthenticated users
  return (
    <div className="min-h-screen bg-background">
      <LandingPage />
    </div>
  )
}