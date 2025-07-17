import fs from 'fs';
import { CertificateInfo, CertificateData, CertificateValidationResult } from './certificate-types';

export class CertificateService {
  private static certificateData: CertificateData | null = null;

  /**
   * Valida um certificado PFX/P12
   * @param pfxBuffer - Buffer do arquivo PFX
   * @param password - Senha do certificado
   * @returns Resultado da validação
   */
  static async validateCertificate(pfxBuffer: Buffer, password: string): Promise<CertificateValidationResult> {
    try {
      // Em um ambiente real, você usaria uma biblioteca como 'node-forge' ou 'crypto'
      // Para esta demonstração, vamos simular a validação
      
      // Verificar se o buffer não está vazio
      if (!pfxBuffer || pfxBuffer.length === 0) {
        return {
          isValid: false,
          error: 'Arquivo de certificado vazio ou inválido'
        };
      }

      // Verificar se a senha foi fornecida
      if (!password || password.trim().length === 0) {
        return {
          isValid: false,
          error: 'Senha do certificado é obrigatória'
        };
      }

      // Simular validação do certificado
      // Em produção, aqui seria feita a validação real usando bibliotecas crypto
      const mockCertInfo: CertificateInfo = {
        name: 'Certificado Digital A1',
        subject: 'CN=EMPRESA TESTE LTDA:12345678000195, L=São Paulo, S=SP, C=BR',
        issuer: 'CN=AC CERTISIGN RFB G5, OU=Secretaria da Receita Federal do Brasil - RFB, O=ICP-Brasil, C=BR',
        validFrom: '2024-01-01T00:00:00Z',
        validTo: '2025-01-01T23:59:59Z',
        serialNumber: '1234567890ABCDEF',
        fingerprint: 'AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD',
        isValid: new Date() < new Date('2025-01-01T23:59:59Z')
      };

      // Verificar se o certificado está dentro da validade
      const now = new Date();
      const validTo = new Date(mockCertInfo.validTo);
      
      if (now > validTo) {
        return {
          isValid: false,
          error: 'Certificado expirado',
          info: mockCertInfo
        };
      }

      return {
        isValid: true,
        info: mockCertInfo
      };

    } catch (error: any) {
      console.error('Erro na validação do certificado:', error);
      return {
        isValid: false,
        error: error.message || 'Erro desconhecido na validação do certificado'
      };
    }
  }

  /**
   * Configura o certificado para uso nas consultas
   * @param pfxBuffer - Buffer do arquivo PFX
   * @param password - Senha do certificado
   * @returns Sucesso na configuração
   */
  static async configureCertificate(pfxBuffer: Buffer, password: string): Promise<boolean> {
    try {
      const validation = await this.validateCertificate(pfxBuffer, password);
      
      if (!validation.isValid) {
        throw new Error(validation.error || 'Certificado inválido');
      }

      this.certificateData = {
        pfxBuffer,
        password,
        info: validation.info
      };

      return true;
    } catch (error) {
      console.error('Erro ao configurar certificado:', error);
      return false;
    }
  }

  /**
   * Obtém o certificado configurado
   * @returns Dados do certificado ou null se não configurado
   */
  static getCertificateData(): CertificateData | null {
    return this.certificateData;
  }

  /**
   * Verifica se há um certificado configurado
   * @returns true se certificado está configurado
   */
  static isCertificateConfigured(): boolean {
    return this.certificateData !== null;
  }

  /**
   * Remove a configuração do certificado
   */
  static clearCertificate(): void {
    this.certificateData = null;
  }

  /**
   * Obtém informações do certificado configurado
   * @returns Informações do certificado ou null
   */
  static getCertificateInfo(): CertificateInfo | null {
    return this.certificateData?.info || null;
  }

  /**
   * Carrega certificado de arquivo no servidor (para produção)
   * @param certificatePath - Caminho para o arquivo PFX
   * @param password - Senha do certificado
   * @returns Sucesso no carregamento
   */
  static async loadCertificateFromFile(certificatePath: string, password: string): Promise<boolean> {
    try {
      if (!fs.existsSync(certificatePath)) {
        throw new Error('Arquivo de certificado não encontrado');
      }

      const pfxBuffer = fs.readFileSync(certificatePath);
      return await this.configureCertificate(pfxBuffer, password);
    } catch (error) {
      console.error('Erro ao carregar certificado do arquivo:', error);
      return false;
    }
  }

  /**
   * Cria as opções HTTPS para usar com axios
   * @returns Opções HTTPS configuradas ou null
   */
  static getHttpsOptions(): any {
    if (!this.isCertificateConfigured()) {
      return null;
    }

    try {
      // Em um ambiente real, você converteria o PFX para chave e certificado
      // e retornaria as opções HTTPS apropriadas
      return {
        pfx: this.certificateData!.pfxBuffer,
        passphrase: this.certificateData!.password,
        rejectUnauthorized: true
      };
    } catch (error) {
      console.error('Erro ao criar opções HTTPS:', error);
      return null;
    }
  }
}