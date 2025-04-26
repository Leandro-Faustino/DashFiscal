"use client"

import { useEffect, useState } from "react"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { FileSpreadsheet, CheckCircle2 } from "lucide-react"
import { cn, formatCurrency, formatDate, formatDocument } from "@/lib/utils"
import { ValidationResult, ValidationService } from "@/lib/validation-service"
import { FilterPanel, FilterValues } from "./filter-panel"

interface ValidationResultsProps {
  results: ValidationResult;
  isProcessing: boolean;
}

export function ValidationResults({ results, isProcessing }: ValidationResultsProps) {
  const [filters, setFilters] = useState<FilterValues | null>(null)
  const [filteredIssues, setFilteredIssues] = useState(results.issues)
  
  // Atualizar os resultados filtrados quando mudam os resultados originais
  useEffect(() => {
    setFilteredIssues(results.issues)
  }, [results])
  
  if (!results) return null;
  
  const handleExportReport = () => {
    // Garantir que exportamos todas as divergências, independente dos filtros aplicados
    ValidationService.downloadValidationReport(results);
  };
  
  const handleExportPdfReport = () => {
    ValidationService.downloadPdfReport(results);
  };

  // Função para formatar valores com base no tipo de campo
  const formatValue = (value: string, field: string) => {
    if (value === "-") return value;
    
    // Campos monetários
    const isMonetary = 
      field.includes("Valor") || 
      field.includes("Base") || 
      field.includes("ICMS") || 
      field.includes("IPI") || 
      field.includes("PIS") || 
      field.includes("COFINS") ||
      (!isNaN(parseFloat(value)) && value.includes("."));
    
    if (isMonetary) {
      return formatCurrency(value);
    }
    
    // Campos de CPF/CNPJ
    const isDocument = 
      field.includes("CNPJ") || 
      field.includes("CPF") || 
      field.includes("Emitente") || 
      field.includes("Destinatario");
      
    if (isDocument && value.length > 8) {
      return formatDocument(value);
    }
    
    // Campos de data
    const isDate = 
      field.includes("Data") || 
      field === "issueDate" ||
      /^\d{4}-\d{2}-\d{2}$/.test(value) || // formato ISO
      /^\d{2}\/\d{2}\/\d{4}$/.test(value); // formato DD/MM/YYYY
      
    if (isDate) {
      return formatDate(value);
    }
    
    return value;
  };
  
  const handleApplyFilters = (newFilters: FilterValues) => {
    setFilters(newFilters)
    
    // Para o filtro "ok", temos que tratar de forma especial
    if (newFilters.statusFilter === 'ok') {
      setFilteredIssues([]) // Não mostra nenhuma issue quando o filtro é 'ok'
      return
    }
    
    // Aplicar os filtros às issues existentes
    const filtered = results.issues.filter(issue => {
      // Filtro por data
      if (newFilters.startDate || newFilters.endDate) {
        const issueDate = new Date(issue.issueDate)
        if (newFilters.startDate && issueDate < newFilters.startDate) {
          return false
        }
        if (newFilters.endDate) {
          // Adiciona 1 dia à data final para incluir todo o dia
          const endDatePlusOne = new Date(newFilters.endDate)
          endDatePlusOne.setDate(endDatePlusOne.getDate() + 1)
          if (issueDate >= endDatePlusOne) {
            return false
          }
        }
      }
      
      // Filtro por CNPJ (simplificado, na implementação real seria verificado em ambos os campos)
      if (newFilters.cnpj && !issue.documentNumber.includes(newFilters.cnpj)) {
        return false
      }
      
      // Filtro por status
      if (newFilters.statusFilter !== 'all') {
        if (newFilters.statusFilter === 'warning' && issue.severity !== 'warning') {
          return false
        }
        if (newFilters.statusFilter === 'error' && issue.severity !== 'error') {
          return false
        }
      }
      
      return true
    })
    
    setFilteredIssues(filtered)
  }
  
  const handleResetFilters = () => {
    setFilters(null)
    setFilteredIssues(results.issues)
  }
  
  // Usar os resultados filtrados se houver filtros aplicados, caso contrário usar todos os resultados
  const issuesToDisplay = filters ? filteredIssues : results.issues;
  
  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4">Resultado da Validação</h3>
      
      <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-md mb-4">
        <div className="flex items-center text-green-800 dark:text-green-400 mb-2">
          <CheckCircle2 className="h-5 w-5 mr-2" />
          <span className="font-medium">Validação concluída</span>
        </div>
        <p className="text-sm text-green-700 dark:text-green-400">
          {results.matchedRecords} de {results.totalRecords} registros validados com sucesso 
          ({Math.round((results.matchedRecords / results.totalRecords) * 100)}%).
        </p>
      </div>
      
        <div>
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-medium">
            {results.issues.length > 0 
              ? `Divergências Encontradas: ${issuesToDisplay.length}` 
              : "Nenhuma divergência encontrada"}
          </h4>
          <FilterPanel 
            onApplyFilters={handleApplyFilters}
            onResetFilters={handleResetFilters}
          />
        </div>
        
        {(results.issues.length > 0 || filters?.statusFilter === 'ok') && (
          <>
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Documento</TableHead>
                  <TableHead>Campo</TableHead>
                  <TableHead>Valor SAT</TableHead>
                  <TableHead>Valor Questor</TableHead>
                  <TableHead>Diferença/Problema</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                  {issuesToDisplay.length > 0 ? (
                    issuesToDisplay.map((issue, index) => (
                  <TableRow key={index} className={
                    issue.severity === "error" ? "bg-red-50 dark:bg-red-950/30" : 
                    issue.severity === "warning" ? "bg-amber-50 dark:bg-amber-950/30" : ""
                  }>
                    <TableCell>
                      <div className="font-medium">#{issue.documentNumber}</div>
                      <div className="text-xs text-muted-foreground">
                        Série: {issue.series} - {formatDate(issue.issueDate)}
                      </div>
                    </TableCell>
                    <TableCell>{issue.field}</TableCell>
                    <TableCell>{formatValue(issue.satValue, issue.field)}</TableCell>
                    <TableCell>{formatValue(issue.questorValue, issue.field)}</TableCell>
                    <TableCell>
                      <div className={cn(
                        "text-sm",
                        issue.severity === "error" ? "text-red-600 dark:text-red-400 font-medium" : 
                        issue.severity === "warning" ? "text-amber-600 dark:text-amber-400" : ""
                      )}>
                        {issue.difference 
                          ? formatValue(issue.difference, issue.field) 
                          : issue.description}
                      </div>
                    </TableCell>
                  </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                        {filters?.statusFilter === 'ok' 
                          ? `${results.matchedRecords} notas fiscais validadas com sucesso.` 
                          : "Nenhum registro encontrado com os filtros aplicados"}
                      </TableCell>
                    </TableRow>
                  )}
              </TableBody>
            </Table>
          </div>
            
            <div className="flex justify-between mt-4">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleExportReport}
                  disabled={isProcessing}
                  className="gap-1"
                  title="Exporta a tabela completa com todas as divergências encontradas"
                >
                  <FileSpreadsheet className="h-4 w-4 mr-1" />
                  Excel
                </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
                  onClick={handleExportPdfReport}
            disabled={isProcessing}
                  className="gap-1"
          >
                  <FileSpreadsheet className="h-4 w-4 mr-1" />
                  PDF
          </Button>
        </div>
              
              <div className="text-sm text-muted-foreground">
                {filters && `Filtros aplicados: ${filteredIssues.length} de ${results.issues.length} divergências`}
              </div>
            </div>
          </>
      )}
      </div>
    </div>
  );
} 