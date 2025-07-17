import { NextRequest, NextResponse } from 'next/server';
import { validarChaveNfe } from '@/lib/nfe-utils';
import { ConsultaNfeRequest, ConsultaNfeResponse } from '@/lib/nfe-types';

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

    // Para demonstração, apenas validar formato (44 dígitos)
    const chave = body.chaveNfe.replace(/\D/g, '');
    if (chave.length !== 44) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Chave NFe deve ter 44 dígitos',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    // Simular diferentes cenários baseado na chave
    let mockResponse: ConsultaNfeResponse;

    // Simular atraso da rede
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    // Diferentes cenários baseados no último dígito da chave
    const ultimoDigito = parseInt(chave.slice(-1));
    
    switch (ultimoDigito) {
      case 0: // NFe Autorizada
        mockResponse = {
          success: true,
          data: {
            situacao: 'Autorizado o uso da NF-e',
            codigo: '100',
            motivo: 'Autorizado o uso da NF-e',
            dataAutorizacao: '2024-03-15T10:30:00-03:00',
            protocolo: '135240001234567',
            chaveNfe: chave,
            nfeProc: {
              nfe: {
                infNFe: {
                  emit: {
                    CNPJ: '12345678000195',
                    xNome: 'EMPRESA EMITENTE LTDA'
                  },
                  dest: {
                    CNPJ: '98765432000187',
                    xNome: 'EMPRESA DESTINATARIA LTDA'
                  },
                  total: {
                    ICMSTot: {
                      vNF: '1500.00',
                      vICMS: '180.00'
                    }
                  }
                }
              }
            }
          },
          timestamp: new Date().toISOString()
        };
        break;
        
      case 1: // NFe Cancelada
        mockResponse = {
          success: true,
          data: {
            situacao: 'Uso autorizado',
            codigo: '101',
            motivo: 'Cancelamento de NF-e homologado',
            dataAutorizacao: '2024-03-15T10:30:00-03:00',
            protocolo: '135240001234568',
            chaveNfe: chave
          },
          timestamp: new Date().toISOString()
        };
        break;
        
      case 2: // NFe Denegada
        mockResponse = {
          success: true,
          data: {
            situacao: 'Uso denegado',
            codigo: '110',
            motivo: 'Uso denegado',
            dataAutorizacao: '2024-03-15T10:30:00-03:00',
            protocolo: '135240001234569',
            chaveNfe: chave
          },
          timestamp: new Date().toISOString()
        };
        break;
        
      case 7: // NFe Não Encontrada
        mockResponse = {
          success: false,
          data: {
            situacao: 'Documento não encontrado',
            codigo: '217',
            motivo: 'NF-e não consta na base de dados da SEFAZ',
            chaveNfe: chave
          },
          timestamp: new Date().toISOString()
        };
        break;
        
      default: // NFe Autorizada (padrão)
        mockResponse = {
          success: true,
          data: {
            situacao: 'Autorizado o uso da NF-e',
            codigo: '100',
            motivo: 'Autorizado o uso da NF-e',
            dataAutorizacao: '2024-03-15T10:30:00-03:00',
            protocolo: '135240001234567',
            chaveNfe: chave,
            nfeProc: {
              nfe: {
                infNFe: {
                  emit: {
                    CNPJ: '12345678000195',
                    xNome: 'EMPRESA DEMO LTDA'
                  },
                  dest: {
                    CNPJ: '98765432000187',
                    xNome: 'CLIENTE DEMO LTDA'
                  },
                  total: {
                    ICMSTot: {
                      vNF: '2500.75',
                      vICMS: '425.50'
                    }
                  }
                }
              }
            }
          },
          timestamp: new Date().toISOString()
        };
    }

    return NextResponse.json(mockResponse, { status: 200 });

  } catch (error: any) {
    console.error('Erro na API de mock consulta NFe:', error);
    
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
  return NextResponse.json(
    {
      message: 'API de mock para consulta NFe (demonstração)',
      timestamp: new Date().toISOString(),
      scenarios: {
        'chave terminada em 0': 'NFe Autorizada com dados completos',
        'chave terminada em 1': 'NFe Cancelada',
        'chave terminada em 2': 'NFe Denegada',
        'chave terminada em 7': 'NFe Não Encontrada',
        'outros': 'NFe Autorizada padrão'
      }
    },
    { status: 200 }
  );
}