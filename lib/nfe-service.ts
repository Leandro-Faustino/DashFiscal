import axios from 'axios';
import https from 'https';
import { XMLParser } from 'fast-xml-parser';
import { ConsultaNfeResponse, WebserviceUrls, UF_MAP } from './nfe-types';
import { CertificateService } from './certificate-service';

export class NfeService {
  private static readonly TIMEOUT = 30000;
  
  // URLs dos webservices SEFAZ para consulta de NFe
  private static readonly WEBSERVICE_URLS: WebserviceUrls = {
    'SP': {
      producao: 'https://nfe.fazenda.sp.gov.br/ws/nfeconsultaprotocolo4.asmx',
      homologacao: 'https://homologacao.nfe.fazenda.sp.gov.br/ws/nfeconsultaprotocolo4.asmx'
    },
    'RJ': {
      producao: 'https://nfe.fazenda.rj.gov.br/ws/nfeconsultaprotocolo4.asmx',
      homologacao: 'https://homologacao.nfe.fazenda.rj.gov.br/ws/nfeconsultaprotocolo4.asmx'
    },
    'MG': {
      producao: 'https://nfe.fazenda.mg.gov.br/ws/nfeconsultaprotocolo4.asmx',
      homologacao: 'https://hnfe.fazenda.mg.gov.br/ws/nfeconsultaprotocolo4.asmx'
    },
    'RS': {
      producao: 'https://nfe.fazenda.rs.gov.br/ws/NfeConsultaProtocolo/NfeConsultaProtocolo4.asmx',
      homologacao: 'https://nfe-homologacao.fazenda.rs.gov.br/ws/NfeConsultaProtocolo/NfeConsultaProtocolo4.asmx'
    },
    'PR': {
      producao: 'https://nfe.fazenda.pr.gov.br/nfe/NFeConsultaProtocolo4',
      homologacao: 'https://homologacao.nfe.fazenda.pr.gov.br/nfe/NFeConsultaProtocolo4'
    },
    'SC': {
      producao: 'https://nfe.fazenda.sc.gov.br/ws/nfeconsultaprotocolo4.asmx',
      homologacao: 'https://hom.nfe.fazenda.sc.gov.br/ws/nfeconsultaprotocolo4.asmx'
    }
  };

  /**
   * Consulta uma NFe no SEFAZ
   * @param chaveNfe - Chave da NFe (44 dígitos)
   * @param ambiente - 1=Produção, 2=Homologação
   * @param uf - UF do emitente (código de 2 dígitos)
   * @returns Resultado da consulta
   */
  static async consultarNfe(chaveNfe: string, ambiente: 1 | 2, uf?: string): Promise<ConsultaNfeResponse> {
    try {
      // Remove formatação da chave
      const chaveLimpa = chaveNfe.replace(/\D/g, '');
      
      if (chaveLimpa.length !== 44) {
        return {
          success: false,
          error: 'Chave NFe deve ter 44 dígitos',
          timestamp: new Date().toISOString()
        };
      }

      // Extrai UF da chave se não fornecida
      const ufCode = uf || chaveLimpa.substring(0, 2);
      const ufSigla = this.obterSiglaUF(ufCode);
      
      // Obter URL do webservice
      const url = this.obterUrlWebservice(ufSigla, ambiente);
      if (!url) {
        return {
          success: false,
          error: `Webservice não disponível para UF: ${ufSigla}`,
          timestamp: new Date().toISOString()
        };
      }

      // Criar XML da consulta
      const xmlConsulta = this.criarXmlConsulta(chaveLimpa, ambiente);
      
      // Configurar HTTPS com certificado se disponível
      let httpsAgent;
      
      if (CertificateService.isCertificateConfigured()) {
        const httpsOptions = CertificateService.getHttpsOptions();
        if (httpsOptions) {
          httpsAgent = new https.Agent(httpsOptions);
        } else {
          return {
            success: false,
            error: 'Erro na configuração do certificado digital',
            timestamp: new Date().toISOString()
          };
        }
      } else {
        // Para desenvolvimento ou testes sem certificado
        httpsAgent = new https.Agent({
          rejectUnauthorized: false
        });
      }

      // Fazer a requisição SOAP
      const response = await axios.post(url, xmlConsulta, {
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': 'http://www.portalfiscal.inf.br/nfe/wsdl/NFeConsultaProtocolo4/nfeConsultaNF',
          'User-Agent': 'DashFiscal/1.0'
        },
        timeout: this.TIMEOUT,
        httpsAgent
      });

      // Processar resposta
      return this.processarResposta(response.data, chaveLimpa);
      
    } catch (error: any) {
      console.error('Erro na consulta NFe:', error);
      
      if (error.code === 'ECONNABORTED') {
        return {
          success: false,
          error: 'Timeout na consulta. Tente novamente.',
          timestamp: new Date().toISOString()
        };
      }
      
      if (error.response?.status === 500) {
        return {
          success: false,
          error: 'Erro no servidor SEFAZ. Tente novamente mais tarde.',
          timestamp: new Date().toISOString()
        };
      }
      
      return {
        success: false,
        error: error.message || 'Erro desconhecido na consulta',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Cria o XML SOAP para consulta de NFe
   * @param chaveNfe - Chave da NFe
   * @param ambiente - Ambiente (1=Produção, 2=Homologação)
   * @returns XML SOAP
   */
  private static criarXmlConsulta(chaveNfe: string, ambiente: 1 | 2): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:nfe="http://www.portalfiscal.inf.br/nfe/wsdl/NFeConsultaProtocolo4">
  <soap:Header/>
  <soap:Body>
    <nfe:nfeDadosMsg>
      <consSitNFe xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">
        <tpAmb>${ambiente}</tpAmb>
        <xServ>CONSULTAR</xServ>
        <chNFe>${chaveNfe}</chNFe>
      </consSitNFe>
    </nfe:nfeDadosMsg>
  </soap:Body>
</soap:Envelope>`;
  }

  /**
   * Processa a resposta XML do SEFAZ
   * @param xmlResponse - Resposta XML
   * @param chaveNfe - Chave da NFe consultada
   * @returns Resultado processado
   */
  private static processarResposta(xmlResponse: string, chaveNfe: string): ConsultaNfeResponse {
    try {
      const parser = new XMLParser({
        ignoreAttributes: false,
        removeNSPrefix: true
      });
      
      const result = parser.parse(xmlResponse);
      
      // Navegar pela estrutura do XML de resposta
      const retConsSitNFe = result?.Envelope?.Body?.nfeConsultaNFResponse?.nfeConsultaNFResult?.retConsSitNFe;
      
      if (!retConsSitNFe) {
        // Tentar encontrar mensagem de erro
        const fault = result?.Envelope?.Body?.Fault;
        if (fault) {
          return {
            success: false,
            error: fault.faultstring || 'Erro no webservice SEFAZ',
            timestamp: new Date().toISOString()
          };
        }
        
        return {
          success: false,
          error: 'Resposta inválida do SEFAZ',
          timestamp: new Date().toISOString()
        };
      }

      const cStat = retConsSitNFe.cStat;
      const xMotivo = retConsSitNFe.xMotivo;
      
      // Se a consulta foi bem sucedida
      if (cStat === '100' || cStat === '101' || cStat === '110' || cStat === '135' || cStat === '150' || cStat === '151' || cStat === '155') {
        const protNFe = retConsSitNFe.protNFe;
        
        return {
          success: true,
          data: {
            situacao: xMotivo,
            codigo: cStat,
            motivo: xMotivo,
            dataAutorizacao: protNFe?.infProt?.dhRecbto,
            protocolo: protNFe?.infProt?.nProt,
            chaveNfe,
            nfeProc: retConsSitNFe.procEventoNFe || undefined
          },
          timestamp: new Date().toISOString()
        };
      }
      
      // NFe não encontrada ou outros status
      return {
        success: cStat !== '217', // 217 = NFe não encontrada
        data: {
          situacao: xMotivo,
          codigo: cStat,
          motivo: xMotivo,
          chaveNfe
        },
        timestamp: new Date().toISOString()
      };
      
    } catch (error: any) {
      console.error('Erro ao processar resposta XML:', error);
      return {
        success: false,
        error: 'Erro ao processar resposta do SEFAZ',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Obtém a URL do webservice para uma UF e ambiente
   * @param uf - Sigla da UF
   * @param ambiente - Ambiente (1=Produção, 2=Homologação)
   * @returns URL do webservice
   */
  private static obterUrlWebservice(uf: string, ambiente: 1 | 2): string | null {
    const urls = this.WEBSERVICE_URLS[uf];
    if (!urls) return null;
    
    return ambiente === 1 ? urls.producao : urls.homologacao;
  }

  /**
   * Converte código de UF para sigla
   * @param ufCode - Código da UF (2 dígitos)
   * @returns Sigla da UF
   */
  private static obterSiglaUF(ufCode: string): string {
    const ufInfo = UF_MAP[ufCode];
    return ufInfo?.codigo || 'SP'; // Default para SP se não encontrar
  }

  /**
   * Valida se uma UF tem webservice disponível
   * @param uf - Sigla da UF
   * @returns true se disponível
   */
  static isUFDisponivel(uf: string): boolean {
    return Object.keys(this.WEBSERVICE_URLS).includes(uf);
  }

  /**
   * Obtém lista de UFs disponíveis
   * @returns Array com siglas das UFs disponíveis
   */
  static getUFsDisponiveis(): string[] {
    return Object.keys(this.WEBSERVICE_URLS);
  }
}