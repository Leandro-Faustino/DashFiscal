"use client"

import { useState, useCallback, useRef } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { useSidebar } from "@/context/sidebar-context"
import { useSettings } from "@/context/settings-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { toast } from "sonner"
import { Upload, File, X, CheckCircle2, AlertCircle, FileSpreadsheet, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { ExcelService } from "@/lib/excel-service"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default function UploadPage() {
  const { isCollapsed } = useSidebar();
  const { outputPath } = useSettings();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessed, setIsProcessed] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [processingResults, setProcessingResults] = useState<{ 
    success: boolean;
    message: string;
    filename?: string;
    errors?: string[];
  } | null>(null);
  const [showSpecDialog, setShowSpecDialog] = useState(false);
  const fileReader = useRef<FileReader | null>(null);
  
  const handleFileSelection = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".txt";
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        validateAndSetFile(target.files[0]);
      }
    };
    input.click();
  };
  
  const validateAndSetFile = (file: File) => {
    // Reset states
    setHasError(false);
    setErrorMessage("");
    setIsProcessed(false);
    setProcessingResults(null);
    setFileContent(null);
    
    // Validate file type
    if (!file.name.endsWith('.txt')) {
      setHasError(true);
      setErrorMessage("Apenas arquivos .txt são permitidos");
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setHasError(true);
      setErrorMessage("O arquivo deve ter no máximo 5MB");
      return;
    }
    
    setSelectedFile(file);
    
    // Ler o conteúdo do arquivo
    fileReader.current = new FileReader();
    fileReader.current.onload = (e) => {
      const content = e.target?.result as string;
      setFileContent(content);
    };
    fileReader.current.readAsText(file);
    
    toast.success("Arquivo selecionado com sucesso", {
      description: file.name
    });
  };
  
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  }, []);
  
  const handleUpload = async () => {
    if (!selectedFile || !fileContent) return;
    
    setIsUploading(true);
    
    try {
      // Verifica se o caminho de saída está configurado
      if (!outputPath) {
        toast.error("Caminho de saída não configurado", {
          description: "Configure o diretório de saída na página de configurações"
        });
        setIsUploading(false);
        return;
      }
      
      // Log para debug - mostrar o começo do arquivo para verificar estrutura
      const firstLines = fileContent.split('\n').slice(0, 3);
      console.log('Primeiras linhas do arquivo:', firstLines);
      
      // Mostra um aviso se a primeira linha não começar com '|'
      if (firstLines.length > 0 && !firstLines[0].trim().startsWith('|')) {
        toast.warning("Formato do arquivo pode não ser adequado", {
          description: "As linhas devem começar com o delimitador '|' para processamento correto"
        });
      }
      
      // Processar o arquivo usando o serviço
      const result = await ExcelService.processTextFile(fileContent, outputPath);
      
      setProcessingResults(result);
      setIsProcessed(true);
      
      if (result.success) {
        toast.success("Arquivo processado com sucesso", {
          description: `Planilha '${result.filename}' foi gerada e disponibilizada para download. Em um ambiente de produção, seria salva em: ${outputPath}`
        });
        
        // Se houver erros (não fatais), mostra também uma notificação de aviso
        if (result.errors && result.errors.length > 0) {
          toast.warning(`${result.errors.length} linha(s) com problemas`, {
            description: "Veja os detalhes nos resultados do processamento"
          });
        }
      } else {
        toast.error("Erro ao processar arquivo", {
          description: result.message
        });
      }
      
    } catch (error) {
      console.error("Erro ao processar arquivo:", error);
      setProcessingResults({
        success: false,
        message: `Erro inesperado: ${error instanceof Error ? error.message : String(error)}`
      });
      
      toast.error("Erro inesperado", {
        description: error instanceof Error ? error.message : "Falha ao processar o arquivo"
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  const clearSelection = () => {
    setSelectedFile(null);
    setFileContent(null);
    setIsProcessed(false);
    setHasError(false);
    setProcessingResults(null);
    
    // Cancelar qualquer leitura em andamento
    if (fileReader.current && fileReader.current.readyState === 1) {
      fileReader.current.abort();
    }
  };
  
  const renderSpecification = () => (
    <Dialog open={showSpecDialog} onOpenChange={setShowSpecDialog}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Especificação do Processamento</DialogTitle>
          <DialogDescription>
            Detalhes de como o sistema processa seu arquivo TXT e gera o Excel.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 text-sm">
          <h3 className="text-lg font-semibold mb-2">Requisito Funcional: Geração de Planilha Excel a partir de arquivo TXT</h3>
          
          <Accordion type="single" collapsible>
            <AccordionItem value="desc">
              <AccordionTrigger>Descrição Geral</AccordionTrigger>
              <AccordionContent>
                <div>
                  O sistema lê um arquivo de texto (.txt) cuja estrutura é delimitada pelo caractere "|", 
                  agrupa as linhas pelo valor do <strong>primeiro</strong> campo de cada linha e gera um 
                  arquivo Excel (.xlsx) contendo uma aba (sheet) para cada grupo. O nome de cada aba será 
                  exatamente o valor desse primeiro campo. Caso haja múltiplas linhas com o mesmo primeiro campo, 
                  todas devem aparecer na mesma aba. Os dados começarão da coluna A no Excel.
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="flow">
              <AccordionTrigger>Fluxo de Processamento</AccordionTrigger>
              <AccordionContent>
                <ol className="list-decimal pl-4 space-y-2">
                  <li>
                    <strong>Carregar arquivo:</strong> O usuário inicia a leitura do arquivo TXT.
                  </li>
                  <li>
                    <strong>Parse das linhas:</strong> Para cada linha, dividir a string pelo separador "|". 
                    Extrair o primeiro elemento resultante como chave de agrupamento.
                  </li>
                  <li>
                    <strong>Agrupamento:</strong> Agrupar todas as linhas pelo valor do primeiro campo.
                  </li>
                  <li>
                    <strong>Geração da planilha:</strong> Criar um workbook Excel com uma aba para cada grupo.
                  </li>
                  <li>
                    <strong>Salvar ou Download:</strong> Na web, a planilha é disponibilizada para download. 
                    Em um ambiente de produção, seria salva no diretório configurado na tela de configurações.
                  </li>
                </ol>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="rules">
              <AccordionTrigger>Regras de Negócio</AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc pl-4 space-y-2">
                  <li>Se o nome do primeiro campo exceder 31 caracteres (limite do Excel), será truncado.</li>
                  <li>Caracteres inválidos para nome de aba ([]:*?/\) serão substituídos por "_".</li>
                  <li>Linhas vazias ou sem delimitador serão descartadas e registradas no log.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="example">
              <AccordionTrigger>Exemplo</AccordionTrigger>
              <AccordionContent>
                <div className="mb-2">Dado o arquivo de exemplo:</div>
                <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
                  |0000|002|0|||01042011|30042011|EMPRESA ZZZ|88888888000191|MG|3106200||00|0|<br/>
                  |0001|0|<br/>
                  |0110|1||1|<br/>
                  |0140|1|EMPRESA ZZZ|88888888000191|MG||3106200|||<br/>
                  |0990|5|<br/>
                  |0140|1|EMPRESA LKFL|88888888000192|MG||3106222|||
                </pre>
                <div className="mt-2 mb-2">Importante! Note que:</div>
                <ul className="list-disc pl-4 mb-2 text-xs">
                  <li>Cada linha <strong>começa</strong> com o delimitador "|"</li>
                  <li>O primeiro elemento vazio (antes do primeiro "|") será removido automaticamente</li>
                  <li>O valor que será usado como nome da aba é o primeiro campo válido</li>
                  <li>Os dados começarão a partir da coluna A no Excel</li>
                </ul>
                <div className="mt-2">A planilha terá as seguintes abas:</div>
                <ul className="list-disc pl-4">
                  <li><strong>0000</strong>, contendo apenas a primeira linha</li>
                  <li><strong>0001</strong>, contendo a segunda linha</li>
                  <li><strong>0110</strong>, contendo a terceira linha</li>
                  <li><strong>0140</strong>, contendo a quarta <strong>e</strong> a sexta linha</li>
                  <li><strong>0990</strong>, contendo a quinta linha</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </DialogContent>
    </Dialog>
  );
  
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h1 className="text-xl sm:text-2xl font-bold">Upload</h1>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowSpecDialog(true)}
                className="w-full sm:w-auto"
              >
                <Info className="h-4 w-4 mr-2" />
                <span className="sm:inline">Ver Especificação</span>
              </Button>
            </div>
            
            <Card className="max-w-2xl">
              <CardHeader>
                <CardTitle>Upload de Arquivo</CardTitle>
                <CardDescription>
                  Selecione um arquivo .txt contendo os dados para processamento.
                </CardDescription>
                {!outputPath && (
                  <div className="text-destructive mt-2 text-sm">
                    Atenção: Configure o diretório de saída na página de configurações 
                    antes de processar arquivos.
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {!selectedFile ? (
                  <div 
                    className={cn(
                      "border-2 border-dashed rounded-lg p-12 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors",
                      isDragging && "border-primary bg-muted/50",
                      hasError && "border-destructive"
                    )}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={handleFileSelection}
                  >
                    <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="font-medium text-lg mb-1">
                      Arraste e solte o arquivo ou clique para selecionar
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Apenas arquivos .txt são aceitos (máx. 5MB)
                    </p>
                    
                    {hasError && (
                      <div className="text-destructive text-sm mt-2 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errorMessage}
                      </div>
                    )}
                    
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFileSelection();
                      }}
                    >
                      <File className="h-4 w-4 mr-2" />
                      Selecionar Arquivo
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 border rounded-md bg-muted/50 flex justify-between items-center">
                      <div className="flex items-center">
                        <File className="h-8 w-8 text-blue-500 mr-3 flex-shrink-0" />
                        <div className="overflow-hidden">
                          <h3 className="font-medium truncate">{selectedFile.name}</h3>
                          <div className="text-sm text-muted-foreground">
                            {(selectedFile.size / 1024).toFixed(2)} KB
                          </div>
                        </div>
                      </div>
                      
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={clearSelection}
                        disabled={isUploading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {isProcessed ? (
                      <div className={cn(
                        "p-4 rounded-md flex items-start border",
                        processingResults?.success 
                          ? "bg-green-50 border-green-200 text-green-700" 
                          : "bg-red-50 border-red-200 text-red-700"
                      )}>
                        {processingResults?.success ? (
                          <CheckCircle2 className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                        )}
                        <div>
                          <div className="font-medium">{processingResults?.message}</div>
                          
                          {processingResults?.success && processingResults.filename && (
                            <div className="mt-1 text-sm flex items-center">
                              <FileSpreadsheet className="h-4 w-4 mr-1" />
                              Arquivo gerado: {processingResults.filename}
                            </div>
                          )}
                          
                          {processingResults?.success && (
                            <div className="mt-1 text-sm text-muted-foreground">
                              Diretório configurado: {outputPath}
                            </div>
                          )}
                          
                          {processingResults?.errors && processingResults.errors.length > 0 && (
                            <div className="mt-2">
                              <div className="text-sm font-medium">Alertas ({processingResults.errors.length}):</div>
                              <ul className="text-xs mt-1 list-disc pl-5 max-h-32 overflow-y-auto">
                                {processingResults.errors.map((error, idx) => (
                                  <li key={idx}>{error}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <Button 
                        disabled={isUploading || hasError || !fileContent || !outputPath} 
                        className="w-full"
                        onClick={handleUpload}
                      >
                        {isUploading ? "Processando..." : "Processar Arquivo"}
                      </Button>
                    )}
                    
                    {!outputPath && fileContent && !isProcessed && (
                      <div className="p-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-md text-sm flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>É necessário configurar um diretório de destino nas configurações antes de processar o arquivo.</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
            
            {renderSpecification()}
          </div>
        </main>
      </div>
    </div>
  )
}