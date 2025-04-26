"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirecionar para a página de splash
    router.push("/splash")
  }, [router])
  
  return null
}