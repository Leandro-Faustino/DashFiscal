import * as XLSX from 'xlsx'

interface ProcessedSheet {
  name: string
  data: string[][]
}

interface ProcessingResult {
  success: boolean
  message: string
  filename?: string
  errors?: string[]
}

/**
 * Serviço para processar arquivos TXT e gerar planilhas Excel
 */
export class ExcelService {
  
  /**
   * Processa um arquivo TXT e agrupa os dados por primeiro campo
   * @param fileContent - Conteúdo do arquivo TXT
   * @param outputPath - Caminho onde o arquivo Excel será salvo
   * @returns Resultado do processamento
   */
  static async processTextFile(fileContent: string, outputPath: string): Promise<ProcessingResult> {
    try {
      const lines = fileContent.split('\n');
      const groupedData = new Map<string, string[][]>();
      const errors: string[] = [];
      
      // Processa cada linha do arquivo
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Pula linhas vazias
        if (!line) {
          errors.push(`Linha ${i + 1}: Linha vazia ignorada`);
          continue;
        }
        
        // Verifica se a linha tem pelo menos um delimitador
        if (!line.includes('|')) {
          errors.push(`Linha ${i + 1}: Não contém delimitador '|'`);
          continue;
        }
        
        // Divide a linha pelo delimitador
        const originalFields = line.split('|');
        
        // Remove o primeiro elemento se for vazio (caso a linha comece com '|')
        // Isso garante que o dado comece na coluna A no Excel
        const fields = originalFields[0] === '' ? originalFields.slice(1) : originalFields;
        
        // O primeiro campo é o primeiro elemento do array depois de processar
        const key = fields[0]?.trim();
        
        if (!key) {
          errors.push(`Linha ${i + 1}: Primeiro campo vazio ou inválido`);
          continue;
        }
        
        // Sanitiza o nome da aba para conformidade com Excel
        const sheetName = this.sanitizeSheetName(key);
        
        // Agrupa os dados por chave
        if (!groupedData.has(sheetName)) {
          groupedData.set(sheetName, []);
        }
        
        // Adicionamos a linha processada para preservar todos os dados
        groupedData.get(sheetName)?.push(fields);
      }
      
      // Se não tiver dados para processar
      if (groupedData.size === 0) {
        return {
          success: false,
          message: 'Não foi possível extrair dados válidos do arquivo.',
          errors
        };
      }
      
      // Cria a planilha Excel com os dados agrupados
      const result = await this.createExcelFile(groupedData, outputPath);
      
      return {
        success: true,
        message: 'Arquivo processado com sucesso',
        filename: result.filename,
        errors: errors.length > 0 ? errors : undefined
      };
      
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      return {
        success: false,
        message: `Erro ao processar o arquivo: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
  
  /**
   * Sanitiza o nome da aba conforme regras do Excel
   * @param name - Nome original
   * @returns Nome sanitizado
   */
  private static sanitizeSheetName(name: string): string {
    // Remove caracteres inválidos para nomes de planilhas
    let sanitized = name.replace(/[\[\]:*?\/\\]/g, '_');
    
    // Limita o tamanho a 31 caracteres (limitação do Excel)
    if (sanitized.length > 31) {
      sanitized = sanitized.substring(0, 31);
    }
    
    return sanitized;
  }
  
  /**
   * Cria o arquivo Excel a partir dos dados agrupados
   * @param groupedData - Dados agrupados por chave
   * @param outputPath - Caminho de saída
   * @returns Informações sobre o arquivo criado
   */
  private static async createExcelFile(
    groupedData: Map<string, string[][]>, 
    outputPath: string
  ): Promise<{ filename: string }> {
    // Cria um novo workbook
    const workbook = XLSX.utils.book_new();
    
    // Para cada grupo de dados, cria uma aba
    groupedData.forEach((rows, sheetName) => {
      // Cria uma worksheet com os dados
      const worksheet = XLSX.utils.aoa_to_sheet(rows);
      
      // Adiciona a worksheet ao workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    });
    
    // Gera um nome de arquivo baseado na data/hora atual
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `registros_${timestamp}.xlsx`;
    
    // Caminho completo para salvar o arquivo
    const fullPath = outputPath ? 
      `${outputPath.replace(/[\\\/]$/, '')}/${filename}` : 
      filename;
    
    // Em um ambiente de navegador, não é possível salvar diretamente no sistema de arquivos
    // Geramos o arquivo para download pelo usuário
    
    // Gera o arquivo em formato binário
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    
    // Cria um Blob com os dados
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    // Faz o download do arquivo
    this.downloadExcelFile(blob, filename);
    
    return { filename };
  }
  
  /**
   * Cria um link para download do arquivo gerado
   * @param blob - Dados do arquivo
   * @param filename - Nome do arquivo
   */
  static downloadExcelFile(blob: Blob, filename: string): void {
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
} 