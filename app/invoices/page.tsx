"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { useSidebar } from "@/context/sidebar-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileSpreadsheet } from "lucide-react"
import { toast } from "sonner"
import { FileUpload } from "./components/file-upload"
import { ValidationRules } from "./components/validation-rules"
import { ValidationRulesDestinadas } from "./components/validation-rules-destinadas"
import { ValidationResults } from "./components/validation-results"
import { NfeConsultation } from "./components/nfe-consultation"
import { ValidationService, ValidationResult } from "@/lib/validation-service"

export default function InvoicesPage() {
  const { isCollapsed } = useSidebar();
  
  // Estado para arquivo SAT Emitidas
  const [satFile, setSatFile] = useState<File | null>(null);
  const [satHasError, setSatHasError] = useState(false);
  const [satErrorMessage, setSatErrorMessage] = useState("");
  
  // Estado para arquivo Questor Saídas
  const [questorFile, setQuestorFile] = useState<File | null>(null);
  const [questorHasError, setQuestorHasError] = useState(false);
  const [questorErrorMessage, setQuestorErrorMessage] = useState("");
  
  // Estado para arquivo SAT Destinadas
  const [satDestinadasFile, setSatDestinadasFile] = useState<File | null>(null);
  const [satDestinadasHasError, setSatDestinadasHasError] = useState(false);
  const [satDestinadasErrorMessage, setSatDestinadasErrorMessage] = useState("");
  
  // Estado para arquivo Questor Entradas
  const [questorEntradasFile, setQuestorEntradasFile] = useState<File | null>(null);
  const [questorEntradasHasError, setQuestorEntradasHasError] = useState(false);
  const [questorEntradasErrorMessage, setQuestorEntradasErrorMessage] = useState("");
  
  // Estados compartilhados
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationResults, setValidationResults] = useState<ValidationResult | null>(null);
  const [validationDestinadasResults, setValidationDestinadasResults] = useState<ValidationResult | null>(null);
  
  // Validação de arquivo SAT Emitidas
  const handleSatFileSelected = (file: File) => {
    // Reset states
    setSatHasError(false);
    setSatErrorMessage("");
    setValidationResults(null);
    
    // Validar tipo de arquivo
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!validExtensions.includes(fileExt)) {
      setSatHasError(true);
      setSatErrorMessage("Apenas arquivos Excel ou CSV são permitidos");
      return;
    }
    
    // Validar tamanho (máx 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setSatHasError(true);
      setSatErrorMessage("O arquivo deve ter no máximo 10MB");
      return;
    }
    
    setSatFile(file);
    
    toast.success("Planilha SAT selecionada", {
      description: file.name
    });
  };
  
  // Validação de arquivo Questor Saídas
  const handleQuestorFileSelected = (file: File) => {
    // Reset states
    setQuestorHasError(false);
    setQuestorErrorMessage("");
    setValidationResults(null);
    
    // Validar tipo de arquivo
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!validExtensions.includes(fileExt)) {
      setQuestorHasError(true);
      setQuestorErrorMessage("Apenas arquivos Excel ou CSV são permitidos");
      return;
    }
    
    // Validar tamanho (máx 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setQuestorHasError(true);
      setQuestorErrorMessage("O arquivo deve ter no máximo 10MB");
      return;
    }
    
    setQuestorFile(file);
    
    toast.success("Planilha Questor selecionada", {
      description: file.name
    });
  };
  
  // Validação de arquivo SAT Destinadas
  const handleSatDestinadasFileSelected = (file: File) => {
    // Reset states
    setSatDestinadasHasError(false);
    setSatDestinadasErrorMessage("");
    setValidationDestinadasResults(null);
    
    // Validar tipo de arquivo
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!validExtensions.includes(fileExt)) {
      setSatDestinadasHasError(true);
      setSatDestinadasErrorMessage("Apenas arquivos Excel ou CSV são permitidos");
      return;
    }
    
    // Validar tamanho (máx 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setSatDestinadasHasError(true);
      setSatDestinadasErrorMessage("O arquivo deve ter no máximo 10MB");
      return;
    }
    
    setSatDestinadasFile(file);
    
    toast.success("Planilha SAT Destinadas selecionada", {
      description: file.name
    });
  };
  
  // Validação de arquivo Questor Entradas
  const handleQuestorEntradasFileSelected = (file: File) => {
    // Reset states
    setQuestorEntradasHasError(false);
    setQuestorEntradasErrorMessage("");
    setValidationDestinadasResults(null);
    
    // Validar tipo de arquivo
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!validExtensions.includes(fileExt)) {
      setQuestorEntradasHasError(true);
      setQuestorEntradasErrorMessage("Apenas arquivos Excel ou CSV são permitidos");
      return;
    }
    
    // Validar tamanho (máx 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setQuestorEntradasHasError(true);
      setQuestorEntradasErrorMessage("O arquivo deve ter no máximo 10MB");
      return;
    }
    
    setQuestorEntradasFile(file);
    
    toast.success("Planilha Questor Entradas selecionada", {
      description: file.name
    });
  };
  
  // Limpar seleção de arquivo SAT Emitidas
  const clearSatSelection = () => {
    setSatFile(null);
    setSatHasError(false);
    setValidationResults(null);
  };
  
  // Limpar seleção de arquivo Questor Saídas
  const clearQuestorSelection = () => {
    setQuestorFile(null);
    setQuestorHasError(false);
    setValidationResults(null);
  };
  
  // Limpar seleção de arquivo SAT Destinadas
  const clearSatDestinadasSelection = () => {
    setSatDestinadasFile(null);
    setSatDestinadasHasError(false);
    setValidationDestinadasResults(null);
  };
  
  // Limpar seleção de arquivo Questor Entradas
  const clearQuestorEntradasSelection = () => {
    setQuestorEntradasFile(null);
    setQuestorEntradasHasError(false);
    setValidationDestinadasResults(null);
  };
  
  // Processar validação entre arquivos para NF-e Emitidas
  const processValidation = async () => {
    if (!satFile || !questorFile) return;
    
    setIsProcessing(true);
    setValidationResults(null);
    
    try {
      // Chamar o serviço de validação
      const results = await ValidationService.validateSatQuestor(satFile, questorFile);
      
      setValidationResults(results);
      
      toast.success("Validação concluída", {
        description: `${results.matchedRecords} de ${results.totalRecords} registros validados com sucesso`
      });
      
      if (results.issues.length > 0) {
        const errorCount = results.issues.filter(issue => issue.severity === "error").length;
        
        if (errorCount > 0) {
          toast.error(`${errorCount} erro(s) crítico(s) encontrado(s)`, {
            description: "Verifique o relatório para detalhes"
          });
        } else {
          toast.warning(`${results.issues.length} divergência(s) encontrada(s)`, {
            description: "Verifique o relatório para detalhes"
          });
        }
      }
      
    } catch (error) {
      console.error("Erro na validação:", error);
      
      toast.error("Erro ao processar validação", {
        description: error instanceof Error ? error.message : "Falha inesperada na validação"
      });
      
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Processar validação entre arquivos para NF-e Destinadas
  const processValidacaoDestinadas = async () => {
    if (!satDestinadasFile || !questorEntradasFile) return;
    
    setIsProcessing(true);
    setValidationDestinadasResults(null);
    
    try {
      // Chamar o serviço de validação específico para Destinadas
      const results = await ValidationService.validateSatQuestorDestinadas(satDestinadasFile, questorEntradasFile);
      
      setValidationDestinadasResults(results);
      
      toast.success("Validação concluída", {
        description: `${results.matchedRecords} de ${results.totalRecords} registros validados com sucesso`
      });
      
      if (results.issues.length > 0) {
        const errorCount = results.issues.filter(issue => issue.severity === "error").length;
        
        if (errorCount > 0) {
          toast.error(`${errorCount} erro(s) crítico(s) encontrado(s)`, {
            description: "Verifique o relatório para detalhes"
          });
        } else {
          toast.warning(`${results.issues.length} divergência(s) encontrada(s)`, {
            description: "Verifique o relatório para detalhes"
          });
        }
      }
      
    } catch (error) {
      console.error("Erro na validação:", error);
      
      toast.error("Erro ao processar validação", {
        description: error instanceof Error ? error.message : "Falha inesperada na validação"
      });
      
    } finally {
      setIsProcessing(false);
    }
  };
  
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
            <h1 className="text-xl sm:text-2xl font-bold mb-4">Notas Fiscais</h1>
            
            <Tabs defaultValue="emitidas" className="w-full">
              <TabsList className="mb-4 grid grid-cols-3 w-full max-w-lg">
                <TabsTrigger value="emitidas" className="text-xs sm:text-sm">NF-e EMITIDAS</TabsTrigger>
                <TabsTrigger value="destinadas" className="text-xs sm:text-sm">NF-e DESTINADAS</TabsTrigger>
                <TabsTrigger value="consulta" className="text-xs sm:text-sm">CONSULTA NF-e</TabsTrigger>
              </TabsList>
              
              <TabsContent value="emitidas">
                <Card>
                  <CardHeader>
                    <CardTitle>Validação: SAT Emitidas vs Questor Saídas</CardTitle>
                    <CardDescription>
                      Faça upload das planilhas para verificar a consistência de dados entre os sistemas.
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4 sm:space-y-6">
                    <ValidationRules />
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <h3 className="text-base sm:text-lg font-medium mb-2">Planilha SAT - NF-e Emitidas</h3>
                        <FileUpload
                          title="Arraste a planilha SAT ou clique para selecionar"
                          description="Excel ou CSV contendo os dados de NF-e emitidas do SAT"
                          accept=".xlsx,.xls,.csv"
                          maxSizeInMB={10}
                          onFileSelected={handleSatFileSelected}
                          onFileRemoved={clearSatSelection}
                          selectedFile={satFile}
                          disabled={isProcessing}
                          fileIcon={<FileSpreadsheet className="h-8 w-8 text-green-600 mr-3 flex-shrink-0" />}
                          errorMessage={satHasError ? satErrorMessage : undefined}
                        />
                      </div>
                      
                      <div>
                        <h3 className="text-base sm:text-lg font-medium mb-2">Planilha Questor - Saídas</h3>
                        <FileUpload
                          title="Arraste a planilha Questor ou clique para selecionar"
                          description="Excel ou CSV contendo os dados de saídas do sistema Questor"
                          accept=".xlsx,.xls,.csv"
                          maxSizeInMB={10}
                          onFileSelected={handleQuestorFileSelected}
                          onFileRemoved={clearQuestorSelection}
                          selectedFile={questorFile}
                          disabled={isProcessing}
                          fileIcon={<FileSpreadsheet className="h-8 w-8 text-blue-600 mr-3 flex-shrink-0" />}
                          errorMessage={questorHasError ? questorErrorMessage : undefined}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-center">
                      <Button 
                        onClick={processValidation}
                        disabled={!satFile || !questorFile || isProcessing}
                        className="w-full max-w-md text-sm sm:text-base"
                        size="lg"
                      >
                        {isProcessing ? "Processando..." : "Validar Planilhas"}
                      </Button>
                    </div>
                    
                    {validationResults && (
                      <ValidationResults 
                        results={validationResults} 
                        isProcessing={isProcessing} 
                      />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="destinadas">
                <Card>
                  <CardHeader>
                    <CardTitle>Validação: SAT Destinadas vs Questor Entradas</CardTitle>
                    <CardDescription>
                      Faça upload das planilhas para verificar a consistência de dados entre os sistemas.
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4 sm:space-y-6">
                    <ValidationRulesDestinadas />
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <h3 className="text-base sm:text-lg font-medium mb-2">Planilha SAT - NF-e Destinadas</h3>
                        <FileUpload
                          title="Arraste a planilha SAT ou clique para selecionar"
                          description="Excel ou CSV contendo os dados de NF-e destinadas do SAT"
                          accept=".xlsx,.xls,.csv"
                          maxSizeInMB={10}
                          onFileSelected={handleSatDestinadasFileSelected}
                          onFileRemoved={clearSatDestinadasSelection}
                          selectedFile={satDestinadasFile}
                          disabled={isProcessing}
                          fileIcon={<FileSpreadsheet className="h-8 w-8 text-green-600 mr-3 flex-shrink-0" />}
                          errorMessage={satDestinadasHasError ? satDestinadasErrorMessage : undefined}
                        />
                      </div>
                      
                      <div>
                        <h3 className="text-base sm:text-lg font-medium mb-2">Planilha Questor - Entradas</h3>
                        <FileUpload
                          title="Arraste a planilha Questor ou clique para selecionar"
                          description="Excel ou CSV contendo os dados de entradas do sistema Questor"
                          accept=".xlsx,.xls,.csv"
                          maxSizeInMB={10}
                          onFileSelected={handleQuestorEntradasFileSelected}
                          onFileRemoved={clearQuestorEntradasSelection}
                          selectedFile={questorEntradasFile}
                          disabled={isProcessing}
                          fileIcon={<FileSpreadsheet className="h-8 w-8 text-blue-600 mr-3 flex-shrink-0" />}
                          errorMessage={questorEntradasHasError ? questorEntradasErrorMessage : undefined}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-center">
                      <Button 
                        onClick={processValidacaoDestinadas}
                        disabled={!satDestinadasFile || !questorEntradasFile || isProcessing}
                        className="w-full max-w-md text-sm sm:text-base"
                        size="lg"
                      >
                        {isProcessing ? "Processando..." : "Validar Planilhas"}
                      </Button>
                    </div>
                    
                    {validationDestinadasResults && (
                      <ValidationResults 
                        results={validationDestinadasResults} 
                        isProcessing={isProcessing} 
                      />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="consulta">
                <NfeConsultation />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}