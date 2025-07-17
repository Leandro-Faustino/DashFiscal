"use client"

import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { useSidebar } from "@/context/sidebar-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CertificateManager } from "@/app/invoices/components/certificate-manager"

export default function SettingsPage() {
  const { isCollapsed } = useSidebar();
  
  return (
    <div className="flex h-screen">
      <Sidebar />
      
      {/* Conteúdo principal */}
      <div className="flex-1 min-w-0 transition-all duration-300">
        <div className="sticky top-0 z-30 w-full">
          <Header />
        </div>
        <main className="h-[calc(100vh-64px)] overflow-y-auto">
          <div className="p-3 sm:p-6 lg:p-8">
            <h1 className="text-xl sm:text-2xl font-bold mb-6">Configurações</h1>
            
            <div className="max-w-2xl space-y-6">
              {/* Certificado Digital */}
              <CertificateManager />
              
              <Card>
                <CardHeader>
                  <CardTitle>Sobre o Sistema</CardTitle>
                  <CardDescription>
                    Informações sobre o DashFiscal e configurações do sistema.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-sm">Versão</h3>
                      <p className="text-sm text-muted-foreground">1.0.0</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">Funcionalidades</h3>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Conciliação de dados SAT vs Questor</li>
                        <li>• Validação de notas fiscais emitidas e destinadas</li>
                        <li>• Geração de relatórios em Excel</li>
                        <li>• Consulta de NFe online</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">Downloads</h3>
                      <p className="text-sm text-muted-foreground">
                        Todos os arquivos processados são automaticamente disponibilizados para download.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}