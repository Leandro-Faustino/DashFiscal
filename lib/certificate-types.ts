export interface CertificateInfo {
  name: string;
  subject: string;
  issuer: string;
  validFrom: string;
  validTo: string;
  serialNumber: string;
  fingerprint: string;
  isValid: boolean;
}

export interface CertificateData {
  pfxBuffer: Buffer;
  password: string;
  info?: CertificateInfo;
}

export interface CertificateUpload {
  file: File;
  password: string;
}

export interface CertificateConfig {
  certificatePath?: string;
  certificatePassword?: string;
  certificateBuffer?: Buffer;
  isConfigured: boolean;
}

export interface CertificateValidationResult {
  isValid: boolean;
  error?: string;
  info?: CertificateInfo;
}