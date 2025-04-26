"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { useSidebar } from "@/context/sidebar-context"
import { useSettings } from "@/context/settings-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Folder } from "lucide-react"

// Schema para validação do formulário
const formSchema = z.object({
  folderPath: z.string().min(1, { message: "Caminho da pasta é obrigatório" })
})

type FormValues = z.infer<typeof formSchema>

export default function SettingsPage() {
  const { isCollapsed } = useSidebar();
  const { outputPath, setOutputPath } = useSettings();
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      folderPath: ""
    }
  });

  // Carregar o valor do contexto quando o componente é montado
  useEffect(() => {
    if (outputPath) {
      form.setValue("folderPath", outputPath);
      setSelectedFolder(outputPath);
    }
  }, [outputPath, form]);

  const handleSubmit = (data: FormValues) => {
    setOutputPath(data.folderPath);
    setSelectedFolder(data.folderPath);
    
    toast.success("Pasta de destino configurada com sucesso", {
      description: `Caminho: ${data.folderPath}`
    });
  };

  const handleFolderSelection = () => {
    // No ambiente real do navegador, não é possível selecionar diretórios nativamente
    // sem APIs específicas. Aqui estamos simulando.
    // Em uma implementação real, seria feito através de um diálogo do sistema operacional
    // ou um explorador de arquivos personalizado
    
    // Simulando um caminho de diretório para demonstração
    const simulatedPath = "C:/Documentos/Arquivos Tratados";
    form.setValue("folderPath", simulatedPath);
  };
  
  return (
    <div className="flex h-screen">
      {/* Sidebar Desktop */}
      <div className="hidden md:block h-full">
        <Sidebar />
      </div>
      
      {/* Sidebar Mobile - Visível apenas em dispositivos móveis */}
      <div className="block md:hidden h-full">
        <Sidebar />
      </div>
      
      {/* Conteúdo principal */}
      <div className="flex-1 transition-all duration-300">
        <div className="sticky top-0 z-30 w-full">
          <Header />
        </div>
        <main className="h-[calc(100vh-64px)] overflow-y-auto">
          <div className="p-4 sm:p-8">
            <h1 className="text-2xl font-bold mb-6">Configurações</h1>
            
            <Card className="max-w-2xl">
              <CardHeader>
                <CardTitle>Configuração de Diretório</CardTitle>
                <CardDescription>
                  Configure o diretório onde serão salvos seus arquivos tratados pelo sistema.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="folderPath"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Diretório de Destino</FormLabel>
                          <div className="flex space-x-2">
                            <FormControl>
                              <Input 
                                placeholder="Selecione a pasta para arquivos tratados" 
                                {...field} 
                                className="flex-1"
                              />
                            </FormControl>
                            <Button 
                              type="button" 
                              variant="outline"
                              onClick={handleFolderSelection}
                            >
                              <Folder className="h-4 w-4 mr-2" />
                              Buscar
                            </Button>
                          </div>
                          <FormDescription>
                            Este será o local onde todos os arquivos processados pelo sistema serão salvos.
                            No ambiente web, os arquivos serão disponibilizados para download.
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit">Salvar Configuração</Button>
                  </form>
                </Form>
                
                {selectedFolder && (
                  <div className="mt-4 p-3 bg-muted rounded-md">
                    <div className="text-sm font-medium">Diretório configurado:</div>
                    <div className="text-sm text-muted-foreground">{selectedFolder}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}