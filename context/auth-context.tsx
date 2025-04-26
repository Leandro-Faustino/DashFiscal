"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useRouter } from "next/navigation"

type User = {
  email: string
  name: string
}

type AuthContextType = {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Verificar se o usuário está logado ao carregar a página
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  // Credenciais fixas para o teste
  const TEST_EMAIL = "admin@dashfiscal.com.br"
  const TEST_PASSWORD = "123456"
  
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    
    // Simular um atraso de rede
    return new Promise((resolve) => {
      setTimeout(() => {
        if (email === TEST_EMAIL && password === TEST_PASSWORD) {
          // Login com sucesso
          const userData = { email, name: "Administrador" }
          localStorage.setItem("user", JSON.stringify(userData))
          setUser(userData)
          setIsLoading(false)
          resolve(true)
        } else {
          // Login falhou
          setIsLoading(false)
          resolve(false)
        }
      }, 1000)
    })
  }

  const logout = () => {
    localStorage.removeItem("user")
    setUser(null)
    router.push("/login")
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
} 