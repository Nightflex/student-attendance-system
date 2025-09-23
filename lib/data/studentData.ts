import jwt from "jsonwebtoken"
import { executeQuery } from "@/lib/db"
import { redirect } from "next/navigation"


export async function fetch_student_data(token: string){
    // 🔐 Verify and decode JWT
  

}