import { ChaveNfe, ChaveInfo, UF_MAP } from './nfe-types';

/**
 * Valida uma chave de NFe de 44 dígitos
 * @param chave - Chave NFe (44 dígitos)
 * @returns true se a chave for válida
 */
export function validarChaveNfe(chave: string): boolean {
  if (!chave) return false;
  
  // Remove caracteres não numéricos
  const chaveNumerica = chave.replace(/\D/g, '');
  
  // Verifica se tem 44 dígitos
  if (chaveNumerica.length !== 44) return false;
  
  // Verifica se todos são números
  if (!/^\d{44}$/.test(chaveNumerica)) return false;
  
  // Valida o dígito verificador
  const digitoCalculado = calcularDigitoVerificador(chaveNumerica.substring(0, 43));
  const digitoInformado = parseInt(chaveNumerica.charAt(43));
  
  return digitoCalculado === digitoInformado;
}

/**
 * Formata uma chave NFe com espaços para melhor visualização
 * @param chave - Chave NFe
 * @returns Chave formatada
 */
export function formatarChave(chave: string): string {
  if (!chave) return '';
  
  const chaveNumerica = chave.replace(/\D/g, '');
  
  if (chaveNumerica.length === 0) return '';
  
  // Formata em grupos de 4 dígitos: 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000
  return chaveNumerica.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

/**
 * Calcula o dígito verificador de uma chave NFe
 * @param chave - Chave NFe sem o dígito verificador (43 dígitos)
 * @returns Dígito verificador
 */
export function calcularDigitoVerificador(chave: string): number {
  if (chave.length !== 43) {
    throw new Error('Chave deve ter 43 dígitos para calcular o dígito verificador');
  }
  
  const sequencia = [4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  
  let soma = 0;
  for (let i = 0; i < 43; i++) {
    soma += parseInt(chave.charAt(i)) * sequencia[i];
  }
  
  const resto = soma % 11;
  
  if (resto < 2) {
    return 0;
  } else {
    return 11 - resto;
  }
}

/**
 * Extrai informações da chave NFe
 * @param chave - Chave NFe (44 dígitos)
 * @returns Informações extraídas da chave
 */
export function extrairInfoChave(chave: string): ChaveInfo | null {
  const chaveNumerica = chave.replace(/\D/g, '');
  
  if (chaveNumerica.length !== 44) return null;
  
  try {
    const uf = chaveNumerica.substring(0, 2);
    const dataEmissao = chaveNumerica.substring(2, 8); // AAMMDD
    const cnpjEmitente = chaveNumerica.substring(8, 22);
    const modelo = chaveNumerica.substring(22, 24);
    const serie = chaveNumerica.substring(24, 27);
    const numeroNF = chaveNumerica.substring(27, 36);
    const tipoEmissao = chaveNumerica.substring(36, 37);
    const codigoNumerico = chaveNumerica.substring(37, 43);
    const digitoVerificador = chaveNumerica.substring(43, 44);
    
    // Formatar data de emissão
    const ano = parseInt(dataEmissao.substring(0, 2));
    const anoCompleto = ano >= 0 && ano <= 30 ? 2000 + ano : 1900 + ano; // Assume que anos 00-30 são 2000-2030
    const mes = dataEmissao.substring(2, 4);
    const dia = dataEmissao.substring(4, 6);
    const dataFormatada = `${dia}/${mes}/${anoCompleto}`;
    
    // Formatar CNPJ
    const cnpjFormatado = cnpjEmitente.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    
    return {
      uf: UF_MAP[uf]?.nome || `UF ${uf}`,
      dataEmissao: dataFormatada,
      cnpjEmitente: cnpjFormatado,
      modelo,
      serie: parseInt(serie).toString(),
      numeroNF: parseInt(numeroNF).toString(),
      tipoEmissao,
      codigoNumerico,
      digitoVerificador
    };
  } catch (error) {
    console.error('Erro ao extrair informações da chave:', error);
    return null;
  }
}

/**
 * Cria um objeto ChaveNfe com validação e formatação
 * @param chave - Chave NFe
 * @returns Objeto ChaveNfe
 */
export function criarChaveNfe(chave: string): ChaveNfe {
  const chaveNumerica = chave.replace(/\D/g, '');
  
  return {
    chave: chaveNumerica,
    valida: validarChaveNfe(chaveNumerica),
    formatada: formatarChave(chaveNumerica)
  };
}

/**
 * Formata CNPJ/CPF
 * @param documento - CNPJ ou CPF
 * @returns Documento formatado
 */
export function formatarDocumento(documento: string): string {
  if (!documento) return '';
  
  const numeros = documento.replace(/\D/g, '');
  
  if (numeros.length === 11) {
    // CPF
    return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  } else if (numeros.length === 14) {
    // CNPJ
    return numeros.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  
  return documento;
}

/**
 * Formata valor monetário
 * @param valor - Valor numérico
 * @returns Valor formatado como moeda brasileira
 */
export function formatarValor(valor: string | number): string {
  if (!valor) return 'R$ 0,00';
  
  const numero = typeof valor === 'string' ? parseFloat(valor) : valor;
  
  if (isNaN(numero)) return 'R$ 0,00';
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(numero);
}

/**
 * Formata data para exibição
 * @param dataString - Data em string
 * @returns Data formatada
 */
export function formatarData(dataString: string): string {
  if (!dataString) return '';
  
  try {
    // Se a data estiver no formato ISO (YYYY-MM-DDTHH:mm:ss)
    if (dataString.includes('T')) {
      const data = new Date(dataString);
      return data.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    // Se for apenas a data (YYYY-MM-DD)
    if (dataString.includes('-')) {
      const [ano, mes, dia] = dataString.split('-');
      return `${dia}/${mes}/${ano}`;
    }
    
    return dataString;
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return dataString;
  }
}

/**
 * Obtém as chaves de teste para homologação
 * @returns Array de chaves de teste válidas
 */
export function obterChavesTeste(): string[] {
  return [
    '35200214200166000187550010000000071123456789',
    '35200314200166000187550010000000081234567890',
    '35200414200166000187550010000000091345678901'
  ];
}