import { NextRequest, NextResponse } from 'next/server';
import { CertificateService } from '@/lib/certificate-service';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('certificate') as File;
    const password = formData.get('password') as string;

    if (!file) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Arquivo de certificado é obrigatório',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Senha do certificado é obrigatória',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    // Verificar extensão do arquivo
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.pfx') && !fileName.endsWith('.p12')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Apenas arquivos .pfx ou .p12 são aceitos',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    // Converter file para buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validar certificado
    const validation = await CertificateService.validateCertificate(buffer, password);
    
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          success: false, 
          error: validation.error || 'Certificado inválido',
          timestamp: new Date().toISOString()
        },
        { status: 422 }
      );
    }

    // Configurar certificado
    const configured = await CertificateService.configureCertificate(buffer, password);
    
    if (!configured) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Erro ao configurar certificado',
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          message: 'Certificado configurado com sucesso',
          info: validation.info
        },
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Erro no upload do certificado:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  const certificateInfo = CertificateService.getCertificateInfo();
  const isConfigured = CertificateService.isCertificateConfigured();

  return NextResponse.json(
    {
      success: true,
      data: {
        isConfigured,
        info: certificateInfo
      },
      timestamp: new Date().toISOString()
    },
    { status: 200 }
  );
}

export async function DELETE() {
  try {
    CertificateService.clearCertificate();
    
    return NextResponse.json(
      {
        success: true,
        data: {
          message: 'Certificado removido com sucesso'
        },
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    );
    
  } catch (error: any) {
    console.error('Erro ao remover certificado:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}