import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formata um valor numérico para o formato de moeda brasileira
 * @param value - Valor a ser formatado
 * @param currency - Se deve incluir o símbolo da moeda (R$)
 * @returns Valor formatado
 */
export function formatCurrency(value: string | number, currency: boolean = true): string {
  if (value === undefined || value === null || value === '') return '-';
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  // Verifica se é um número válido
  if (isNaN(numValue)) return value.toString();
  
  // Formata o número para o formato brasileiro
  const formatter = new Intl.NumberFormat('pt-BR', {
    style: currency ? 'currency' : 'decimal',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  return formatter.format(numValue);
}

/**
 * Formata um CPF (11 dígitos) ou CNPJ (14 dígitos)
 * @param value - CPF ou CNPJ sem formatação
 * @returns CPF ou CNPJ formatado
 */
export function formatDocument(value: string): string {
  if (!value) return '';
  
  // Remove caracteres não numéricos
  const numbers = value.replace(/\D/g, '');
  
  // Formata como CPF (000.000.000-00)
  if (numbers.length === 11) {
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  
  // Formata como CNPJ (00.000.000/0000-00)
  if (numbers.length === 14) {
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  
  // Retorna o valor original se não for CPF ou CNPJ
  return value;
}

/**
 * Formata uma data para o formato brasileiro DD/MM/YYYY
 * @param value - Data em qualquer formato reconhecível
 * @returns Data formatada
 */
export function formatDate(value: string): string {
  if (!value) return '';
  
  try {
    // Tenta reconhecer se é um número do Excel
    if (/^\d+$/.test(value)) {
      const excelEpoch = new Date(1899, 11, 30); // 30/12/1899
      const daysFromEpoch = parseInt(value);
      const dateObj = new Date(excelEpoch);
      dateObj.setDate(excelEpoch.getDate() + daysFromEpoch);
      
      // Formata para DD/MM/YYYY
      return dateObj.toLocaleDateString('pt-BR');
    }
    
    // Se já for uma data ISO ou outro formato reconhecível
    const dateObj = new Date(value);
    if (!isNaN(dateObj.getTime())) {
      return dateObj.toLocaleDateString('pt-BR');
    }
    
    // Se estiver no formato YYYY-MM-DD
    if (value.includes('-')) {
      const [year, month, day] = value.split('-');
      return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
    }
  } catch (error) {
    console.error("Erro ao formatar data:", error);
  }
  
  return value;
}
