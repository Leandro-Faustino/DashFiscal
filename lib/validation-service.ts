import * as XLSX from 'xlsx';

export interface ValidationIssue {
  documentNumber: string;
  series: string;
  issueDate: string;
  field: string;
  satValue: string;
  questorValue: string;
  difference?: string;
  description?: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  success: boolean;
  totalRecords: number;
  matchedRecords: number;
  issues: ValidationIssue[];
}

// Interface para representar uma nota fiscal SAT
interface SatInvoice {
  NumeroDocumento: string;
  SerieDocumento: string;
  DataEmissao: string;
  CnpjOuCpfDoEmitente: string;
  CnpjOuCpfDoDestinatario: string;
  UfDestinatario: string;
  ModeloDocumento: string;
  TipoDocumento: string;
  TipoDeOperacaoEntradaOuSaida: string;
  Situacao: string;
  ValorTotalNota?: number;
  ValorTotalICMS?: number;
  ValorBaseCalculoICMS?: number;
  ValorBaseCalculoICMSST?: number;
  ValorTotalICMSST?: number;
  ValorFrete?: number;
  ValorSeguro?: number;
  ValorDespesaAcessoria?: number;
  ValorDesconto?: number;
  ValorIPI?: number;
  ValorTotalIpiDevolvA58?: number;
  ValorPis?: number;
  ValorCofins?: number;
}

// Interface para representar uma nota fiscal Questor
interface QuestorInvoice {
  Número: string;
  Série: string;
  "Data Escrituração/Serviço": string;
  "CNPJ EMITENTE": string;
  "CNPJ DESTINATARIO": string;
  Estado: string;
  "Valor Total": number;
  "Valor ICMS": number;
  "Base Cálculo ICMS": number;
  "Base Cálculo Substituição Tributária": number;
  "Valor Substituição Tributária": number;
  "Valor Frete": number;
  "Valor Seguro": number;
  "Valor Despesa Acessória": number;
  "Valor Desconto": number;
  "Valor IPI": number;
  "Valor PIS": number;
  "Valor COFINS": number;
}

export class ValidationService {
  /**
   * Valida dados entre planilhas SAT e Questor para notas emitidas
   * @param satFile - Arquivo da planilha SAT
   * @param questorFile - Arquivo da planilha Questor
   * @returns Resultado da validação
   */
  static async validateSatQuestor(satFile: File, questorFile: File): Promise<ValidationResult> {
    try {
      // Lê os dados das planilhas
      const satData = await this.readExcelFile(satFile) as SatInvoice[];
      const questorData = await this.readExcelFile(questorFile) as QuestorInvoice[];
      
      const issues: ValidationIssue[] = [];
      let totalRecords = 0;
      let matchedRecords = 0;

      // Agrupa registros do SAT pelo NumeroDocumento e SerieDocumento
      const satInvoiceGroups = this.groupSatInvoicesByNumberAndSeries(satData);
      
      // Para cada grupo de notas do SAT
      for (const key in satInvoiceGroups) {
        const satGroup = satInvoiceGroups[key];
        const [numeroDocumento, serieDocumento] = key.split('|');
        totalRecords++;
        
        // RF-001: Validação Inicial de Dados na Planilha SAT Emitidas
        // Verifica se todos os registros do grupo possuem os campos obrigatórios com os valores esperados
        const invalidInitialData = satGroup.some(sat => 
          sat.ModeloDocumento !== "55" || 
          sat.TipoDocumento !== "Nfe" || 
          (sat.Situacao !== "Autorizado" && sat.Situacao !== "CANCELADA")
        );
        
        if (invalidInitialData) {
          issues.push({
            documentNumber: numeroDocumento,
            series: serieDocumento,
            issueDate: satGroup[0].DataEmissao,
            field: "Dados Básicos",
            satValue: "Inválido",
            questorValue: "-",
            description: "Dados básicos inválidos (Modelo, Tipo ou Situação)",
            severity: "error"
          });
          continue;
        }
        
        // RF-002: Tratamento para TipoDeOperacaoEntradaOuSaida
        if (satGroup[0].TipoDeOperacaoEntradaOuSaida === "E") {
          issues.push({
            documentNumber: numeroDocumento,
            series: serieDocumento,
            issueDate: satGroup[0].DataEmissao,
            field: "TipoDeOperacaoEntradaOuSaida",
            satValue: "E",
            questorValue: "-",
            description: "NOTA FISCAL DE ENTRADA - VERIFICAR NO MOVIMENTO DE ENTRADAS",
            severity: "error"
          });
          continue;
        }
        
        // RF-003: Tratamento para Notas Canceladas
        if (satGroup[0].Situacao === "CANCELADA") {
          // Busca correspondência na planilha Questor
          const questorMatch = questorData.find(q => 
            q.Número === numeroDocumento && 
            q.Série === serieDocumento
          );
          
          if (questorMatch && questorMatch["Valor Total"] > 0) {
            issues.push({
              documentNumber: numeroDocumento,
              series: serieDocumento,
              issueDate: satGroup[0].DataEmissao,
              field: "Situacao",
              satValue: "CANCELADA",
              questorValue: questorMatch["Valor Total"]?.toString() || "-",
              description: "NOTA FISCAL CANCELADA",
              severity: "error"
            });
          }
          continue;
        }
        
        // RF-004: Comparação de Campos Identificadores
        
        // Busca correspondência na planilha Questor
        const questorMatch = questorData.find(q => 
          q.Número === numeroDocumento && 
          q.Série === serieDocumento
        );
        
        if (!questorMatch) {
          issues.push({
            documentNumber: numeroDocumento,
            series: serieDocumento,
            issueDate: satGroup[0].DataEmissao,
            field: "Documento",
            satValue: "Presente",
            questorValue: "Ausente",
            description: "Nota fiscal não encontrada na planilha Questor",
            severity: "error"
          });
          continue;
        }
        
        // Validação dos campos de correspondência
        const fieldMappings = [
          { sat: "DataEmissao", questor: "Data Escrituração/Serviço", label: "Data" },
          { sat: "CnpjOuCpfDoEmitente", questor: "CNPJ EMITENTE", label: "CNPJ Emitente" },
          { sat: "CnpjOuCpfDoDestinatario", questor: "CNPJ DESTINATARIO", label: "CNPJ Destinatário" },
          { sat: "UfDestinatario", questor: "Estado", label: "UF Destinatário" }
        ];
        
        let invalidFields = false;
        
        for (const mapping of fieldMappings) {
          const satValue = satGroup[0][mapping.sat as keyof SatInvoice];
          const questorValue = questorMatch[mapping.questor as keyof QuestorInvoice];
          
          // Normalizar CNPJs e CPFs removendo formatação
          let normalizedSatValue = satValue;
          let normalizedQuestorValue = questorValue;
          
          // Se for campo de CNPJ ou CPF, remover formatação antes de comparar
          if (mapping.sat.includes("CnpjOuCpf") || mapping.questor.includes("CNPJ")) {
            normalizedSatValue = this.normalizeDocument(satValue?.toString() || "");
            normalizedQuestorValue = this.normalizeDocument(questorValue?.toString() || "");
          }
          // Se for campo de data, normalizar o formato antes de comparar
          else if (mapping.sat.includes("Data") || mapping.questor.includes("Data")) {
            try {
              normalizedSatValue = this.normalizeDate(satValue?.toString() || "");
              normalizedQuestorValue = this.normalizeDate(questorValue?.toString() || "");
            } catch (error) {
              console.error("Erro ao normalizar data:", error);
              // Em caso de erro na normalização, mantém os valores originais
            }
          }
          
          if (normalizedSatValue !== normalizedQuestorValue) {
            issues.push({
              documentNumber: numeroDocumento,
              series: serieDocumento,
              issueDate: satGroup[0].DataEmissao,
              field: mapping.label,
              satValue: satValue?.toString() || "-",
              questorValue: questorValue?.toString() || "-",
              description: "Divergência entre SAT e Questor",
              severity: "error"
            });
            invalidFields = true;
          }
        }
        
        if (invalidFields) continue;
        
        // RF-005 e RF-006: Agrupamento e Validação de Valores
        // Calcula os valores totalizados da planilha SAT
        const satTotals = this.calculateSatTotals(satGroup);
        
        // Validação dos valores totalizados
        const valueMappings = [
          { sat: "ValorTotalNota", questor: ["Valor Total", "Valor IPI"], label: "Valor Total Nota" },
          { sat: "ValorTotalICMS", questor: ["Valor ICMS"], label: "Valor ICMS" },
          { sat: "ValorBaseCalculoICMS", questor: ["Base Cálculo ICMS"], label: "Base Cálculo ICMS" },
          { sat: "ValorBaseCalculoICMSST", questor: ["Base Cálculo Substituição Tributária"], label: "Base Cálculo ST" },
          { sat: "ValorTotalICMSST", questor: ["Valor Substituição Tributária"], label: "Valor ICMS ST" },
          { sat: "ValorFrete", questor: ["Valor Frete"], label: "Valor Frete" },
          { sat: "ValorSeguro", questor: ["Valor Seguro"], label: "Valor Seguro" },
          { sat: "ValorDespesaAcessoria", questor: ["Valor Despesa Acessória"], label: "Valor Despesa Acessória" },
          { sat: "ValorDesconto", questor: ["Valor Desconto"], label: "Valor Desconto" },
          { sat: "ValorIPI", questor: ["Valor IPI"], label: "Valor IPI" },
          { sat: "ValorPis", questor: ["Valor PIS"], label: "Valor PIS" },
          { sat: "ValorCofins", questor: ["Valor COFINS"], label: "Valor COFINS" }
        ];
        
        let hasValueIssues = false;
        
        for (const mapping of valueMappings) {
          const satValue = satTotals[mapping.sat];
          
          // Para o caso especial onde somamos campos
          let questorValue = 0;
          for (const questorField of mapping.questor) {
            questorValue += questorMatch[questorField as keyof QuestorInvoice] as number || 0;
          }
          
          // RF-008: Tolerância para diferenças de arredondamento (0.01)
          const difference = Math.abs((satValue || 0) - questorValue);
          
          if (difference > 0.01) {
            issues.push({
              documentNumber: numeroDocumento,
              series: serieDocumento,
              issueDate: satGroup[0].DataEmissao,
              field: mapping.label,
              satValue: satValue?.toFixed(2) || "0.00",
              questorValue: questorValue?.toFixed(2) || "0.00",
              difference: difference.toFixed(2),
              severity: difference > 1 ? "error" : "warning" // Diferença grande é erro, pequena é alerta
            });
            hasValueIssues = true;
          }
        }
        
        // RF-007: Tratamento de IPI em Complementares
        // ValorTotalIpiDevolvA58 é usado na interface SatInvoice, enquanto ValorTotalIpiDevolv é mencionado nas regras
        if ((satTotals.ValorTotalIpiDevolvA58 || 0) > 0) {
          issues.push({
            documentNumber: numeroDocumento,
            series: serieDocumento,
            issueDate: satGroup[0].DataEmissao,
            field: "IPI Complementar",
            satValue: satTotals.ValorTotalIpiDevolvA58?.toFixed(2) || "0.00",
            questorValue: "-",
            description: "VERIFICAR VALOR DE IPI EM COMPLEMENTARES",
            severity: "warning"
          });
          hasValueIssues = true;
        }
        
        if (!hasValueIssues) {
          matchedRecords++;
        } else {
          // Verificar se só existem avisos (warnings) e nenhum erro crítico
          const hasOnlyWarnings = !issues.some(issue => 
            issue.documentNumber === numeroDocumento && 
            issue.series === serieDocumento && 
            issue.severity === "error"
          );
          
          // Se só existem avisos, ainda consideramos como validado
          if (hasOnlyWarnings) {
            matchedRecords++;
          }
        }
      }
      
      return {
        success: issues.length === 0,
        totalRecords,
        matchedRecords,
        issues
      };
      
    } catch (error) {
      console.error("Erro na validação:", error);
      throw error;
    }
  }

  /**
   * Valida dados entre planilhas SAT Destinadas e Questor Entradas
   * @param satFile - Arquivo da planilha SAT Destinadas
   * @param questorFile - Arquivo da planilha Questor Entradas
   * @returns Resultado da validação
   */
  static async validateSatQuestorDestinadas(satFile: File, questorFile: File): Promise<ValidationResult> {
    try {
      // Lê os dados das planilhas
      const satData = await this.readExcelFile(satFile) as SatInvoice[];
      const questorData = await this.readExcelFile(questorFile) as QuestorInvoice[];
      
      const issues: ValidationIssue[] = [];
      let totalRecords = 0;
      let matchedRecords = 0;

      // Agrupa registros do SAT pelo NumeroDocumento e SerieDocumento
      const satInvoiceGroups = this.groupSatInvoicesByNumberAndSeries(satData);
      
      // Para cada grupo de notas do SAT
      for (const key in satInvoiceGroups) {
        const satGroup = satInvoiceGroups[key];
        const [numeroDocumento, serieDocumento] = key.split('|');
        totalRecords++;
        
        // RF-001: Validação Inicial de Dados na Planilha SAT Destinadas
        // Verifica se todos os registros do grupo possuem os campos obrigatórios com os valores esperados
        const invalidInitialData = satGroup.some(sat => 
          sat.ModeloDocumento !== "55" || 
          sat.TipoDocumento !== "Nfe" || 
          (sat.Situacao !== "Autorizado" && sat.Situacao !== "CANCELADA")
        );
        
        if (invalidInitialData) {
          issues.push({
            documentNumber: numeroDocumento,
            series: serieDocumento,
            issueDate: satGroup[0].DataEmissao,
            field: "Dados Básicos",
            satValue: "Inválido",
            questorValue: "-",
            description: "Dados básicos inválidos (Modelo, Tipo ou Situação)",
            severity: "error"
          });
          continue;
        }
        
        // RF-002: Tratamento de Exceções na Análise Preliminar
        // Verifica TipoDeOperacaoEntradaOuSaida
        if (satGroup[0].TipoDeOperacaoEntradaOuSaida === "E") {
          issues.push({
            documentNumber: numeroDocumento,
            series: serieDocumento,
            issueDate: satGroup[0].DataEmissao,
            field: "TipoDeOperacaoEntradaOuSaida",
            satValue: "E",
            questorValue: "-",
            description: "NOTA FISCAL ENTRADA FORNECEDOR NÃO DEVE SER ESCRITURADA - VERIFICAR",
            severity: "error"
          });
          continue;
        }
        
        // Verifica Situacao
        if (satGroup[0].Situacao === "CANCELADA") {
          // Busca correspondência na planilha Questor
          const questorMatch = questorData.find(q => 
            q.Número === numeroDocumento && 
            q.Série === serieDocumento
          );
          
          if (questorMatch) {
            issues.push({
              documentNumber: numeroDocumento,
              series: serieDocumento,
              issueDate: satGroup[0].DataEmissao,
            field: "Situacao",
            satValue: "CANCELADA",
              questorValue: questorMatch["Valor Total"]?.toString() || "-",
              description: "NOTA CANCELADA, NÃO DEVE SER ESCRITURADA",
              severity: "error"
            });
          }
          continue;
        }
        
        // RF-003 e RF-004: Comparação de Campos e Validação de Valores
        
        // Busca correspondência na planilha Questor
        const questorMatch = questorData.find(q => 
          q.Número === numeroDocumento && 
          q.Série === serieDocumento
        );
        
        if (!questorMatch) {
          issues.push({
            documentNumber: numeroDocumento,
            series: serieDocumento,
            issueDate: satGroup[0].DataEmissao,
            field: "Documento",
            satValue: "Presente",
            questorValue: "Ausente",
            description: "Nota fiscal não encontrada na planilha Questor",
            severity: "error"
          });
          continue;
        }
        
        // Validação dos campos de correspondência
        const fieldMappings = [
          { sat: "DataEmissao", questor: "Data Escrituração/Serviço", label: "Data" },
          { sat: "CnpjOuCpfDoEmitente", questor: "CNPJ EMITENTE", label: "CNPJ Emitente" },
          { sat: "CnpjOuCpfDoDestinatario", questor: "CNPJ DESTINATARIO", label: "CNPJ Destinatário" },
          { sat: "UfDestinatario", questor: "Estado", label: "UF Destinatário" }
        ];
        
        let invalidFields = false;
        
        for (const mapping of fieldMappings) {
          const satValue = satGroup[0][mapping.sat as keyof SatInvoice];
          const questorValue = questorMatch[mapping.questor as keyof QuestorInvoice];
          
          // Normalizar CNPJs e CPFs removendo formatação
          let normalizedSatValue = satValue;
          let normalizedQuestorValue = questorValue;
          
          // Se for campo de CNPJ ou CPF, remover formatação antes de comparar
          if (mapping.sat.includes("CnpjOuCpf") || mapping.questor.includes("CNPJ")) {
            normalizedSatValue = this.normalizeDocument(satValue?.toString() || "");
            normalizedQuestorValue = this.normalizeDocument(questorValue?.toString() || "");
          }
          // Se for campo de data, normalizar o formato antes de comparar
          else if (mapping.sat.includes("Data") || mapping.questor.includes("Data")) {
            try {
              normalizedSatValue = this.normalizeDate(satValue?.toString() || "");
              normalizedQuestorValue = this.normalizeDate(questorValue?.toString() || "");
            } catch (error) {
              console.error("Erro ao normalizar data:", error);
              // Em caso de erro na normalização, mantém os valores originais
            }
          }
          
          if (normalizedSatValue !== normalizedQuestorValue) {
            issues.push({
              documentNumber: numeroDocumento,
              series: serieDocumento,
              issueDate: satGroup[0].DataEmissao,
              field: mapping.label,
              satValue: satValue?.toString() || "-",
              questorValue: questorValue?.toString() || "-",
              description: "Divergência entre SAT e Questor",
              severity: "error"
            });
            invalidFields = true;
          }
        }
        
        if (invalidFields) continue;
        
        // Calcula os valores totalizados da planilha SAT
        const satTotals = this.calculateSatTotals(satGroup);
        
        // Validação dos valores totalizados
        const valueMappings = [
          { sat: "ValorTotalNota", questor: ["Valor Total", "Valor IPI"], label: "Valor Total Nota" },
          { sat: "ValorTotalICMS", questor: ["Valor ICMS"], label: "Valor ICMS" },
          { sat: "ValorBaseCalculoICMS", questor: ["Base Cálculo ICMS"], label: "Base Cálculo ICMS" },
          { sat: "ValorBaseCalculoICMSST", questor: ["Base Cálculo Substituição Tributária"], label: "Base Cálculo ST" },
          { sat: "ValorTotalICMSST", questor: ["Valor Substituição Tributária"], label: "Valor ICMS ST" },
          { sat: "ValorFrete", questor: ["Valor Frete"], label: "Valor Frete" },
          { sat: "ValorSeguro", questor: ["Valor Seguro"], label: "Valor Seguro" },
          { sat: "ValorDespesaAcessoria", questor: ["Valor Despesa Acessória"], label: "Valor Despesa Acessória" },
          { sat: "ValorDesconto", questor: ["Valor Desconto"], label: "Valor Desconto" },
          { sat: "ValorIPI", questor: ["Valor IPI"], label: "Valor IPI" },
          { sat: "ValorPis", questor: ["Valor PIS"], label: "Valor PIS" },
          { sat: "ValorCofins", questor: ["Valor COFINS"], label: "Valor COFINS" }
        ];
        
        let hasValueIssues = false;
        
        for (const mapping of valueMappings) {
          const satValue = satTotals[mapping.sat];
          
          // Para o caso especial onde somamos campos
          let questorValue = 0;
          for (const questorField of mapping.questor) {
            questorValue += questorMatch[questorField as keyof QuestorInvoice] as number || 0;
          }
          
          // RF-011: Tolerância para diferenças de arredondamento (0.01)
          const difference = Math.abs((satValue || 0) - questorValue);
          
          if (difference > 0.01) {
            issues.push({
              documentNumber: numeroDocumento,
              series: serieDocumento,
              issueDate: satGroup[0].DataEmissao,
              field: mapping.label,
              satValue: satValue?.toFixed(2) || "0.00",
              questorValue: questorValue?.toFixed(2) || "0.00",
              difference: difference.toFixed(2),
              severity: difference > 1 ? "error" : "warning" // Diferença grande é erro, pequena é alerta
            });
            hasValueIssues = true;
          }
        }
        
        // RF-005: Tratamento de IPI em Complementares
        if ((satTotals.ValorTotalIpiDevolvA58 || 0) > 0) {
          issues.push({
            documentNumber: numeroDocumento,
            series: serieDocumento,
            issueDate: satGroup[0].DataEmissao,
            field: "IPI Complementar",
            satValue: satTotals.ValorTotalIpiDevolvA58?.toFixed(2) || "0.00",
            questorValue: "-",
            description: "VERIFICAR VALOR DE IPI EM COMPLEMENTARES",
            severity: "warning"
          });
          hasValueIssues = true;
        }
        
        if (!hasValueIssues) {
          matchedRecords++;
        } else {
          // Verificar se só existem avisos (warnings) e nenhum erro crítico
          const hasOnlyWarnings = !issues.some(issue => 
            issue.documentNumber === numeroDocumento && 
            issue.series === serieDocumento && 
            issue.severity === "error"
          );
          
          // Se só existem avisos, ainda consideramos como validado
          if (hasOnlyWarnings) {
            matchedRecords++;
          }
        }
      }
      
      return {
        success: issues.length === 0,
        totalRecords,
        matchedRecords,
        issues
      };
      
    } catch (error) {
      console.error("Erro na validação:", error);
      throw error;
    }
  }
  
  /**
   * Agrupa registros SAT pelo número e série do documento
   * @param satData - Dados da planilha SAT
   * @returns Registros agrupados por número e série
   */
  private static groupSatInvoicesByNumberAndSeries(satData: SatInvoice[]): Record<string, SatInvoice[]> {
    const groups: Record<string, SatInvoice[]> = {};
    
    satData.forEach(invoice => {
      const key = `${invoice.NumeroDocumento}|${invoice.SerieDocumento}`;
      
      if (!groups[key]) {
        groups[key] = [];
      }
      
      groups[key].push(invoice);
    });
    
    return groups;
  }
  
  /**
   * Calcula os valores totalizados para um grupo de registros SAT
   * @param satGroup - Grupo de registros SAT
   * @returns Valores totalizados
   */
  private static calculateSatTotals(satGroup: SatInvoice[]): Record<string, number> {
    const totals: Record<string, number> = {
      ValorTotalNota: 0,
      ValorTotalICMS: 0,
      ValorBaseCalculoICMS: 0,
      ValorBaseCalculoICMSST: 0,
      ValorTotalICMSST: 0,
      ValorFrete: 0,
      ValorSeguro: 0,
      ValorDespesaAcessoria: 0,
      ValorDesconto: 0,
      ValorIPI: 0,
      ValorTotalIpiDevolvA58: 0,
      ValorPis: 0,
      ValorCofins: 0
    };
    
    satGroup.forEach(invoice => {
      for (const key in totals) {
        const typedKey = key as keyof typeof totals;
        const invoiceValue = invoice[typedKey as keyof SatInvoice] as number | undefined;
        totals[typedKey] += invoiceValue || 0;
      }
    });
    
    return totals;
  }
  
  /**
   * Lê uma planilha Excel e extrai seus dados
   * @param file - Arquivo Excel ou CSV
   * @returns Dados da planilha
   */
  static async readExcelFile(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'array' });
          
          const worksheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[worksheetName];
          
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = (error) => {
        reject(error);
      };
      
      reader.readAsArrayBuffer(file);
    });
  }
  
  /**
   * Gera um relatório Excel com os resultados da validação
   * @param results - Resultados da validação
   * @returns Blob do arquivo Excel
   */
  static generateReportFile(results: ValidationResult): Blob {
    // Criar um workbook
    const workbook = XLSX.utils.book_new();
    
    // Criar dados para a planilha de resumo
    const summaryData = [
      ['Relatório de Validação - SAT vs Questor'],
      [''],
      ['Total de registros analisados', results.totalRecords],
      ['Registros validados com sucesso', results.matchedRecords],
      ['Percentual de sucesso', `${Math.round((results.matchedRecords / results.totalRecords) * 100)}%`],
      ['Total de problemas encontrados', results.issues.length],
      ['']
    ];
    
    // Criar dados para a planilha de divergências
    const issuesData = [
      ['Número', 'Série', 'Data', 'Campo', 'Valor SAT', 'Valor Questor', 'Diferença/Problema', 'Severidade']
    ];
    
    // Função para verificar se um valor é monetário com base no nome do campo
    const isMonetaryField = (fieldName: string) => {
      return (
        fieldName.includes("Valor") || 
        fieldName.includes("Base") || 
        fieldName.includes("ICMS") || 
        fieldName.includes("IPI") || 
        fieldName.includes("PIS") || 
        fieldName.includes("COFINS")
      );
    };
    
    // Função para verificar se um campo é de documento (CPF/CNPJ)
    const isDocumentField = (fieldName: string) => {
      return (
        fieldName.includes("CNPJ") || 
        fieldName.includes("CPF") || 
        fieldName.includes("Emitente") || 
        fieldName.includes("Destinatario")
      );
    };
    
    // Função para verificar se um campo é de data
    const isDateField = (fieldName: string) => {
      return fieldName.includes("Data") || fieldName === "issueDate";
    };
    
    // Adicionar cada problema à planilha
    results.issues.forEach(issue => {
      // Verificar o tipo de dado para formatação adequada
      const isMonetary = isMonetaryField(issue.field);
      const isDocument = isDocumentField(issue.field);
      const isDate = isDateField(issue.field);
      
      // Formatar valores para exibição no Excel
      let satValue = issue.satValue;
      let questorValue = issue.questorValue;
      let difference = issue.difference || issue.description || '';
      
      // Se for um campo monetário, converter para número para que o Excel possa formatar corretamente
      if (isMonetary) {
        if (satValue !== "-" && !isNaN(parseFloat(satValue))) {
          satValue = parseFloat(satValue).toString();
        }
        
        if (questorValue !== "-" && !isNaN(parseFloat(questorValue))) {
          questorValue = parseFloat(questorValue).toString();
        }
        
        if (issue.difference && !isNaN(parseFloat(issue.difference))) {
          difference = parseFloat(issue.difference).toString();
        }
      }
      
      // Se for um campo de data, converter para um formato que o Excel reconheça como data
      if (isDate && issue.issueDate) {
        // Usar a data original para a coluna de data
        const dateObj = new Date(issue.issueDate);
        if (!isNaN(dateObj.getTime())) {
          issue.issueDate = dateObj.toISOString().split('T')[0]; // formato YYYY-MM-DD
        }
      }
      
      issuesData.push([
        issue.documentNumber,
        issue.series,
        issue.issueDate,
        issue.field,
        satValue,
        questorValue,
        difference,
        issue.severity === 'error' ? 'Erro' : 'Alerta'
      ]);
    });
    
    // Adicionar as planilhas ao workbook
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumo');
    
    const issuesSheet = XLSX.utils.aoa_to_sheet(issuesData);
    
    // Configurar formatação para colunas monetárias
    const monetaryColumns = ['E', 'F', 'G']; // Colunas E, F e G são Valor SAT, Valor Questor e Diferença
    const dateColumns = ['C']; // Coluna C é Data
    const numRows = issuesData.length;
    
    // Configurar largura das colunas
    const wscols = [
      { wch: 10 }, // Número
      { wch: 8 },  // Série
      { wch: 12 }, // Data
      { wch: 20 }, // Campo
      { wch: 15 }, // Valor SAT
      { wch: 15 }, // Valor Questor
      { wch: 15 }, // Diferença
      { wch: 10 }  // Severidade
    ];
    
    // Aplicar configurações de coluna
    issuesSheet['!cols'] = wscols;
    
    // Para cada linha
    for (let i = 1; i < numRows; i++) { // Começar de 1 para pular o cabeçalho
      const rowIndex = i + 1; // +1 porque as linhas do Excel começam em 1
      
      // Formatar colunas monetárias
      for (const col of monetaryColumns) {
        const cellRef = `${col}${rowIndex}`;
        const cell = issuesSheet[cellRef];
        
        // Se a célula existir e tiver um valor numérico, configurar o formato
        if (cell && !isNaN(parseFloat(cell.v))) {
          if (!issuesSheet['!types']) issuesSheet['!types'] = {};
          issuesSheet[cellRef] = { ...cell, z: '"R$"#,##0.00;[Red]\\-"R$"#,##0.00' };
        }
      }
      
      // Formatar colunas de data
      for (const col of dateColumns) {
        const cellRef = `${col}${rowIndex}`;
        const cell = issuesSheet[cellRef];
        
        // Se a célula existir e for uma data válida, configurar o formato
        if (cell && cell.v) {
          if (!issuesSheet['!types']) issuesSheet['!types'] = {};
          issuesSheet[cellRef] = { ...cell, z: 'dd/mm/yyyy' };
        }
      }
    }
    
    XLSX.utils.book_append_sheet(workbook, issuesSheet, 'Divergências');
    
    // Adicionar todas as divergências em uma tabela completa
    const allIssuesData: any[][] = [
      // Cabeçalho da tabela com todos os campos relevantes
      ['Número', 'Série', 'Data', 'CNPJ Emitente', 'CNPJ Destinatário', 'UF', 'Situação', 
       'Valor Total Nota', 'Valor ICMS', 'Base Cálculo ICMS', 'Base Cálculo ST', 
       'Valor ICMS ST', 'Valor Frete', 'Valor Seguro', 'Valor Despesa', 
       'Valor Desconto', 'Valor IPI', 'Valor PIS', 'Valor COFINS', 'Status']
    ];
    
    // Agrupar divergências por número e série de documento
    const issuesByDoc = new Map<string, ValidationIssue[]>();
    
    results.issues.forEach(issue => {
      const key = `${issue.documentNumber}|${issue.series}`;
      if (!issuesByDoc.has(key)) {
        issuesByDoc.set(key, []);
      }
      issuesByDoc.get(key)?.push(issue);
    });
    
    // Para cada documento único com divergências
    issuesByDoc.forEach((issues, key) => {
      // Obter primeiro item para dados comuns
      const firstIssue = issues[0];
      
      // Determinar status (se tem erro ou só warnings)
      const hasError = issues.some(i => i.severity === 'error');
      const status = hasError ? 'Erro' : 'Alerta';
      
      // Valores para cada campo
      let valorTotal = '', valorICMS = '', baseICMS = '', baseST = '';
      let valorST = '', valorFrete = '', valorSeguro = '', valorDespesa = '';
      let valorDesconto = '', valorIPI = '', valorPIS = '', valorCOFINS = '';
      let cnpjEmitente = '', cnpjDestinatario = '', uf = '', situacao = '';
      
      // Extrair valores dos campos específicos
      issues.forEach(issue => {
        switch (issue.field) {
          case 'Valor Total Nota': valorTotal = issue.satValue; break;
          case 'Valor ICMS': valorICMS = issue.satValue; break;
          case 'Base Cálculo ICMS': baseICMS = issue.satValue; break;
          case 'Base Cálculo ST': baseST = issue.satValue; break;
          case 'Valor ICMS ST': valorST = issue.satValue; break;
          case 'Valor Frete': valorFrete = issue.satValue; break;
          case 'Valor Seguro': valorSeguro = issue.satValue; break;
          case 'Valor Despesa Acessória': valorDespesa = issue.satValue; break;
          case 'Valor Desconto': valorDesconto = issue.satValue; break;
          case 'Valor IPI': valorIPI = issue.satValue; break;
          case 'Valor PIS': valorPIS = issue.satValue; break;
          case 'Valor COFINS': valorCOFINS = issue.satValue; break;
          case 'CNPJ Emitente': cnpjEmitente = issue.satValue; break;
          case 'CNPJ Destinatário': cnpjDestinatario = issue.satValue; break;
          case 'UF Destinatário': uf = issue.satValue; break;
          case 'Situacao': situacao = issue.satValue; break;
        }
      });
      
      // Adicionar linha com todos os dados
      allIssuesData.push([
        firstIssue.documentNumber,
        firstIssue.series,
        firstIssue.issueDate,
        cnpjEmitente,
        cnpjDestinatario,
        uf,
        situacao,
        valorTotal,
        valorICMS,
        baseICMS,
        baseST,
        valorST,
        valorFrete,
        valorSeguro,
        valorDespesa,
        valorDesconto,
        valorIPI,
        valorPIS,
        valorCOFINS,
        status
      ]);
    });
    
    // Adicionar planilha com tabela completa
    const allIssuesSheet = XLSX.utils.aoa_to_sheet(allIssuesData);
    
    // Configurar formatação para colunas monetárias na tabela completa
    const fullTableMonetaryColumns = ['H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S'];
    const fullTableDateColumn = 'C';
    const fullTableNumRows = allIssuesData.length;
    
    // Configurar largura das colunas
    const fullTableWscols = [
      { wch: 10 }, // Número
      { wch: 8 },  // Série
      { wch: 12 }, // Data
      { wch: 20 }, // CNPJ Emitente
      { wch: 20 }, // CNPJ Destinatário
      { wch: 6 },  // UF
      { wch: 12 }, // Situação
      { wch: 15 }, // Valores...
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 10 }  // Status
    ];
    
    // Aplicar configurações de coluna
    allIssuesSheet['!cols'] = fullTableWscols;
    
    // Para cada linha
    for (let i = 1; i < fullTableNumRows; i++) {
      const rowIndex = i + 1;
      
      // Formatar colunas monetárias
      for (const col of fullTableMonetaryColumns) {
        const cellRef = `${col}${rowIndex}`;
        const cell = allIssuesSheet[cellRef];
        
        if (cell && cell.v && !isNaN(parseFloat(cell.v))) {
          if (!allIssuesSheet['!types']) allIssuesSheet['!types'] = {};
          allIssuesSheet[cellRef] = { ...cell, z: '"R$"#,##0.00;[Red]\\-"R$"#,##0.00' };
        }
      }
      
      // Formatar coluna de data
      const dateCellRef = `${fullTableDateColumn}${rowIndex}`;
      const dateCell = allIssuesSheet[dateCellRef];
      
      if (dateCell && dateCell.v) {
        if (!allIssuesSheet['!types']) allIssuesSheet['!types'] = {};
        allIssuesSheet[dateCellRef] = { ...dateCell, z: 'dd/mm/yyyy' };
      }
    }
    
    XLSX.utils.book_append_sheet(workbook, allIssuesSheet, 'Tabela Completa');
    
    // Gerar o arquivo em formato binário
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    
    // Criar e retornar um Blob com os dados
    return new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
  }
  
  /**
   * Faz o download do relatório de validação
   * @param results - Resultados da validação
   */
  static downloadValidationReport(results: ValidationResult): void {
    const blob = this.generateReportFile(results);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `validacao-sat-questor_${timestamp}.xlsx`;
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // Limpa os recursos
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  }

  /**
   * Faz o download do relatório de validação em formato PDF
   * Esta é uma implementação simulada - em um ambiente real, 
   * usaríamos uma biblioteca como jsPDF ou html2pdf
   * @param results - Resultados da validação
   */
  static downloadPdfReport(results: ValidationResult): void {
    // Em um ambiente real, aqui seria gerado o PDF usando jsPDF ou similar
    // Mostrar alerta informativo sobre a funcionalidade
    alert('Funcionalidade de exportação para PDF será implementada na próxima versão.');
    
    // Simulação de download para demonstração da interface
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    console.log(`Iniciando download simulado do arquivo: validacao-sat-questor_${timestamp}.pdf`);
  }

  /**
   * Normaliza o formato de CNPJ/CPF removendo pontos, traços e barras
   * @param document - Documento (CNPJ ou CPF)
   * @returns Documento normalizado
   */
  private static normalizeDocument(document: string): string {
    return document.replace(/[^\d]/g, '');
  }

  /**
   * Normaliza o formato de data para comparação
   * @param date - Data no formato original (texto ou número Excel)
   * @returns Data no formato padrão
   */
  private static normalizeDate(date: string): string {
    if (!date) return '';
    
    // Remover espaços extras
    date = date.trim();
    
    // Se for número (formato Excel), converter para data
    if (/^\d+$/.test(date)) {
      try {
        // O Excel armazena datas como número de dias desde 01/01/1900
        // Adicionar 1 porque o Excel incorretamente assume que 1900 foi um ano bissexto
        const excelEpoch = new Date(1899, 11, 30); // 30/12/1899
        const daysFromEpoch = parseInt(date);
        const dateObj = new Date(excelEpoch);
        dateObj.setDate(excelEpoch.getDate() + daysFromEpoch);
        
        return dateObj.toISOString().split('T')[0]; // Formato YYYY-MM-DD
      } catch (error) {
        console.error("Erro ao converter número Excel para data:", error);
        return date; // Retorna o original em caso de erro
      }
    }
    
    // Se estiver no formato DD/MM/YYYY
    if (date.includes('/')) {
      try {
        const [day, month, year] = date.split('/');
        // Assegurar que temos 4 dígitos no ano
        const fullYear = year.length === 2 ? `20${year}` : year;
        
        // Formatar como YYYY-MM-DD
        return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      } catch (error) {
        console.error("Erro ao normalizar data do formato texto:", error);
        return date; // Retorna o original em caso de erro
      }
    }
    
    // Se já estiver no formato YYYY-MM-DD ou outro formato não reconhecido, retorna o original
    return date;
  }
}

(function() {
  const originalValidate = ValidationService.validateSatQuestor;
  ValidationService.validateSatQuestor = function(...args) {
    const result = originalValidate.apply(this, args);
    result.then(r => console.log('Debug - Validação Emitidas:', { 
      totalRecords: r.totalRecords, 
      matchedRecords: r.matchedRecords,
      issues: r.issues.length,
      errors: r.issues.filter(i => i.severity === 'error').length,
      warnings: r.issues.filter(i => i.severity === 'warning').length
    }));
    return result;
  };

  const originalValidateDestinadas = ValidationService.validateSatQuestorDestinadas;
  ValidationService.validateSatQuestorDestinadas = function(...args) {
    const result = originalValidateDestinadas.apply(this, args);
    result.then(r => console.log('Debug - Validação Destinadas:', { 
      totalRecords: r.totalRecords, 
      matchedRecords: r.matchedRecords,
      issues: r.issues.length,
      errors: r.issues.filter(i => i.severity === 'error').length,
      warnings: r.issues.filter(i => i.severity === 'warning').length
    }));
    return result;
  };
})(); 