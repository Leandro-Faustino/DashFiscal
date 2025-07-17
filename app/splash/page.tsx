"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

export default function SplashScreen() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [progress, setProgress] = useState(0)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    // Simulação de carregamento
    const timer = setInterval(() => {
      setProgress((prevProgress) => {
        // Aumenta o progresso em incrementos aleatórios para dar uma sensação mais natural
        const increment = Math.floor(Math.random() * 10) + 1
        const nextProgress = Math.min(prevProgress + increment, 100)
        
        // Quando atingir 100%, inicia a animação de fade out
        if (nextProgress === 100) {
          clearInterval(timer)
          setTimeout(() => {
            setFadeOut(true)
            // Redireciona após a animação de fade out
            setTimeout(() => {
              router.push("/login")
            }, 800)
          }, 500)
        }
        
        return nextProgress
      })
    }, 120)

    return () => clearInterval(timer)
  }, [router])
  
  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-slate-100 dark:from-green-950 dark:to-slate-950 text-white transition-opacity duration-800 relative overflow-hidden",
        fadeOut && "opacity-0"
      )}
    >
      {/* Background words */}
      <div className="absolute inset-0 flex flex-wrap justify-center opacity-10 select-none overflow-hidden pointer-events-none leading-tight">
        <div className="flex flex-wrap w-full h-full items-center">
          {Array(80).fill("DashFiscal").map((word, i) => (
            <span key={i} className="text-3xl font-bold mx-4 whitespace-nowrap text-[#217346] dark:text-white">
              {word}
            </span>
          ))}
        </div>
      </div>
      
      {/* Central animation */}
      <div className="flex flex-col items-center p-12 rounded-3xl bg-white/30 dark:bg-black/30 backdrop-blur-sm z-10 border border-white/20 dark:border-white/10 shadow-2xl shadow-[#217346]/20">
        {/* Logo */}
        <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center shadow-lg mb-8 animate-pulse">
          <span className="text-[#217346] text-6xl font-bold">DF</span>
        </div>
        
        {/* Texto */}
        <h1 className="text-4xl font-bold text-[#217346] dark:text-white mb-2 animate-fade-in">DashFiscal</h1>
        <p className="text-slate-700 dark:text-white/80 text-lg mb-12 animate-fade-in-delay">
          Simplificando a Conciliação Fiscal
        </p>
        
        {/* Barra de progresso */}
        <div className="w-64 h-2 bg-slate-200 dark:bg-white/20 rounded-full overflow-hidden mb-4">
          <div 
            className="h-full bg-[#217346] rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Porcentagem */}
        <div className="text-slate-600 dark:text-white/80">
          {progress}%
        </div>
      </div>
    </div>
  )
} 