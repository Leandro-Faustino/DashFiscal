export interface ChaveNfe {
  chave: string;
  valida: boolean;
  formatada: string;
}

export interface ChaveInfo {
  uf: string;
  dataEmissao: string;
  cnpjEmitente: string;
  modelo: string;
  serie: string;
  numeroNF: string;
  tipoEmissao: string;
  codigoNumerico: string;
  digitoVerificador: string;
}

export interface ConsultaNfeRequest {
  chaveNfe: string;
  ambiente: 1 | 2; // 1=Produção, 2=Homologação
  uf?: string;
}

export interface ConsultaNfeResponse {
  success: boolean;
  data?: {
    situacao: string;
    codigo: string;
    motivo: string;
    dataAutorizacao?: string;
    protocolo?: string;
    chaveNfe: string;
    nfeProc?: {
      nfe?: {
        infNFe?: {
          emit?: {
            CNPJ?: string;
            xNome?: string;
          };
          dest?: {
            CNPJ?: string;
            CPF?: string;
            xNome?: string;
          };
          total?: {
            ICMSTot?: {
              vNF?: string;
              vICMS?: string;
            };
          };
        };
      };
    };
  };
  error?: string;
  timestamp: string;
}

export interface StatusNfe {
  codigo: string;
  descricao: string;
  cor: 'green' | 'red' | 'yellow' | 'blue' | 'gray';
}

export interface WebserviceUrls {
  [uf: string]: {
    producao: string;
    homologacao: string;
  };
}

export const STATUS_NFE_MAP: Record<string, StatusNfe> = {
  '100': { codigo: '100', descricao: 'Autorizada', cor: 'green' },
  '101': { codigo: '101', descricao: 'Cancelada', cor: 'red' },
  '110': { codigo: '110', descricao: 'Uso Denegado', cor: 'yellow' },
  '135': { codigo: '135', descricao: 'Evento Registrado', cor: 'blue' },
  '150': { codigo: '150', descricao: 'Autorizada fora de prazo', cor: 'yellow' },
  '151': { codigo: '151', descricao: 'Cancelada fora de prazo', cor: 'red' },
  '155': { codigo: '155', descricao: 'Cancelada por substituição', cor: 'red' },
  '217': { codigo: '217', descricao: 'NFe não encontrada', cor: 'gray' },
  '301': { codigo: '301', descricao: 'Uso irregularmente', cor: 'yellow' },
  '302': { codigo: '302', descricao: 'Cancelada irregularmente', cor: 'red' },
};

export const UF_MAP: Record<string, { nome: string; codigo: string }> = {
  '11': { nome: 'Rondônia', codigo: 'RO' },
  '12': { nome: 'Acre', codigo: 'AC' },
  '13': { nome: 'Amazonas', codigo: 'AM' },
  '14': { nome: 'Roraima', codigo: 'RR' },
  '15': { nome: 'Pará', codigo: 'PA' },
  '16': { nome: 'Amapá', codigo: 'AP' },
  '17': { nome: 'Tocantins', codigo: 'TO' },
  '21': { nome: 'Maranhão', codigo: 'MA' },
  '22': { nome: 'Piauí', codigo: 'PI' },
  '23': { nome: 'Ceará', codigo: 'CE' },
  '24': { nome: 'Rio Grande do Norte', codigo: 'RN' },
  '25': { nome: 'Paraíba', codigo: 'PB' },
  '26': { nome: 'Pernambuco', codigo: 'PE' },
  '27': { nome: 'Alagoas', codigo: 'AL' },
  '28': { nome: 'Sergipe', codigo: 'SE' },
  '29': { nome: 'Bahia', codigo: 'BA' },
  '31': { nome: 'Minas Gerais', codigo: 'MG' },
  '32': { nome: 'Espírito Santo', codigo: 'ES' },
  '33': { nome: 'Rio de Janeiro', codigo: 'RJ' },
  '35': { nome: 'São Paulo', codigo: 'SP' },
  '41': { nome: 'Paraná', codigo: 'PR' },
  '42': { nome: 'Santa Catarina', codigo: 'SC' },
  '43': { nome: 'Rio Grande do Sul', codigo: 'RS' },
  '50': { nome: 'Mato Grosso do Sul', codigo: 'MS' },
  '51': { nome: 'Mato Grosso', codigo: 'MT' },
  '52': { nome: 'Goiás', codigo: 'GO' },
  '53': { nome: 'Distrito Federal', codigo: 'DF' },
};