import { NextRequest, NextResponse } from 'next/server';
import { validarChaveNfe, extrairInfoChave, criarChaveNfe } from '@/lib/nfe-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.chave) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Chave NFe é obrigatória',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    // Criar objeto com validação
    const chaveNfe = criarChaveNfe(body.chave);
    
    // Extrair informações se válida
    const info = chaveNfe.valida ? extrairInfoChave(chaveNfe.chave) : null;

    return NextResponse.json(
      {
        success: true,
        data: {
          ...chaveNfe,
          info
        },
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Erro na validação de chave NFe:', error);
    
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

// Método GET para listar chaves de teste
export async function GET() {
  const chavesTeste = [
    '35200214200166000187550010000000071123456789',
    '35200314200166000187550010000000081234567890',
    '35200414200166000187550010000000091345678901'
  ];

  return NextResponse.json(
    {
      message: 'Chaves de teste para homologação',
      chavesTeste: chavesTeste.map(chave => criarChaveNfe(chave)),
      timestamp: new Date().toISOString()
    },
    { status: 200 }
  );
}