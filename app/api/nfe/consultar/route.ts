import { NextRequest, NextResponse } from 'next/server';
import { NfeService } from '@/lib/nfe-service';
import { validarChaveNfe } from '@/lib/nfe-utils';
import { ConsultaNfeRequest } from '@/lib/nfe-types';

export async function POST(request: NextRequest) {
  try {
    const body: ConsultaNfeRequest = await request.json();
    
    if (!body.chaveNfe) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Chave NFe é obrigatória',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    // Validar chave NFe
    if (!validarChaveNfe(body.chaveNfe)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Chave NFe inválida',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    // Validar ambiente
    if (!body.ambiente || (body.ambiente !== 1 && body.ambiente !== 2)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Ambiente deve ser 1 (Produção) ou 2 (Homologação)',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    // Consultar NFe
    const resultado = await NfeService.consultarNfe(
      body.chaveNfe,
      body.ambiente,
      body.uf
    );

    // Retornar resultado
    if (resultado.success) {
      return NextResponse.json(resultado, { status: 200 });
    } else {
      return NextResponse.json(resultado, { status: 422 });
    }

  } catch (error: any) {
    console.error('Erro na API de consulta NFe:', error);
    
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

// Método GET para verificar se a API está funcionando
export async function GET() {
  return NextResponse.json(
    {
      message: 'API de consulta NFe está funcionando',
      timestamp: new Date().toISOString(),
      endpoints: {
        consultar: 'POST /api/nfe/consultar',
        validarChave: 'POST /api/nfe/validar-chave'
      }
    },
    { status: 200 }
  );
}