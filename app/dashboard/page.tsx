"use client"

import { Sidebar } from "@/components/sidebar"
import { Card } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Activity, DollarSign, Receipt, TrendingUp } from "lucide-react"
import { Header } from "@/components/header"
import { useSidebar } from "@/context/sidebar-context"

const data = [
  { name: 'Jan', value: 4000 },
  { name: 'Fev', value: 3000 },
  { name: 'Mar', value: 2000 },
  { name: 'Abr', value: 2780 },
  { name: 'Mai', value: 1890 },
  { name: 'Jun', value: 2390 },
]

export default function Dashboard() {
  const { isCollapsed } = useSidebar();
  
  return (
    <div className="flex h-screen">
      {/* Sidebar - responsivo */}
      <Sidebar />
      
      {/* Conteúdo principal */}
      <div className="flex-1 transition-all duration-300 min-w-0">
        <div className="sticky top-0 z-30 w-full">
          <Header />
        </div>
        <main className="h-[calc(100vh-64px)] overflow-y-auto">
          <div className="p-3 sm:p-4 lg:p-8">
            <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">Faturamento Mensal</div>
                    <div className="text-2xl font-bold">R$ 24.000</div>
                  </div>
                  <div className="p-2 bg-green-100 rounded-full">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div className="mt-2 text-xs text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  <span>12% comparado ao mês anterior</span>
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">Notas Emitidas</div>
                    <div className="text-2xl font-bold">45</div>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Receipt className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="mt-2 text-xs text-blue-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  <span>5% comparado ao mês anterior</span>
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">Notas Recebidas</div>
                    <div className="text-2xl font-bold">37</div>
                  </div>
                  <div className="p-2 bg-purple-100 rounded-full">
                    <Receipt className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
                <div className="mt-2 text-xs text-purple-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  <span>8% comparado ao mês anterior</span>
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">Taxa de Crescimento</div>
                    <div className="text-2xl font-bold">10%</div>
                  </div>
                  <div className="p-2 bg-red-100 rounded-full">
                    <Activity className="h-5 w-5 text-red-600" />
                  </div>
                </div>
                <div className="mt-2 text-xs text-red-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  <span>2% comparado ao mês anterior</span>
                </div>
              </Card>
            </div>
            
            <div className="rounded-lg border p-4 mb-8">
              <h2 className="text-lg font-semibold mb-4">Faturamento Mensal</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke="#888888" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <YAxis 
                      stroke="#888888" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(value) => `R$${value}`} 
                    />
                    <Tooltip formatter={(value) => [`R$${value}`, 'Valor']} />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      strokeWidth={2} 
                      activeDot={{ r: 6 }} 
                      className="stroke-primary" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 