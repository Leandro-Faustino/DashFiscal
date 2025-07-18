"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { useSidebar } from "@/context/sidebar-context"

import { CompanyTable } from "./company-table"
import { CompanyForm } from "./company-form"
import { companies } from "./data"

export default function CompanyPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const { isCollapsed } = useSidebar();

  function handleFormSubmit(data: any) {
    toast.success("Empresa cadastrada com sucesso!", {
      description: `${data.name} foi adicionada à lista de empresas.`,
    })
    console.log(data)
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar - responsivo */}
      <Sidebar />
      
      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col transition-all duration-300 min-w-0">
        <div className="sticky top-0 z-30 w-full">
          <Header />
        </div>
        <main className="h-[calc(100vh-64px)] overflow-y-auto">
          <div className="p-3 sm:p-4 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 sm:mb-6">
              <h1 className="text-xl sm:text-2xl font-bold">Empresas</h1>
              <Button 
                onClick={() => setIsFormOpen(true)}
                size="sm"
                className="px-4 py-2 h-10 w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                <span className="text-sm sm:text-base">Cadastrar Empresa</span>
              </Button>
            </div>
            
            <CompanyTable companies={companies} />
            
            <CompanyForm 
              open={isFormOpen} 
              onOpenChange={setIsFormOpen} 
              onSubmit={handleFormSubmit}
            />
          </div>
        </main>
      </div>
    </div>
  )
}