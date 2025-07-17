"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Loader2, Search, CheckCircle, XCircle, AlertTriangle, Info, Copy, Eye } from "lucide-react"
import { toast } from "sonner"
import { criarChaveNfe, extrairInfoChave, formatarData, formatarValor, formatarDocumento } from "@/lib/nfe-utils"
import { ConsultaNfeResponse, STATUS_NFE_MAP, ChaveInfo } from "@/lib/nfe-types"
import { CertificateManager } from "./certificate-manager"

interface NfeConsultationProps {
  className?: string
}

export function NfeConsultation({ className }: NfeConsultationProps) {
  const [chaveInput, setChaveInput] = useState("")
  const [ambiente, setAmbiente] = useState<"1" | "2">("2")
  const [isLoading, setIsLoading] = useState(false)
  const [resultado, setResultado] = useState<ConsultaNfeResponse | null>(null)
  const [chaveInfo, setChaveInfo] = useState<ChaveInfo | null>(null)
  const [chaveValida, setChaveValida] = useState(false)
  const [certificateConfigured, setCertificateConfigured] = useState(false)

  // Validar chave em tempo real
  useEffect(() => {
    if (chaveInput.length > 0) {
      const chaveObj = criarChaveNfe(chaveInput)
      setChaveValida(chaveObj.valida)
      
      if (chaveObj.valida) {
        const info = extrairInfoChave(chaveObj.chave)
        setChaveInfo(info)
      } else {
        setChaveInfo(null)
      }
    } else {
      setChaveValida(false)
      setChaveInfo(null)
    }
  }, [chaveInput])

  const handleChaveChange = (value: string) => {
    // Remove caracteres não numéricos e limita a 44 dígitos
    const numerosSemFormatacao = value.replace(/\D/g, '').slice(0, 44)
    
    // Formatar com espaços a cada 4 dígitos apenas se houver números
    const chaveFormatada = numerosSemFormatacao.length > 0 
      ? numerosSemFormatacao.replace(/(\d{4})(?=\d)/g, '$1 ')
      : ''
    
    setChaveInput(chaveFormatada)
    setResultado(null)
  }

  const consultarNfe = async () => {
    if (!chaveValida) {
      toast.error("Chave NFe inválida")
      return
    }

    setIsLoading(true)
    setResultado(null)

    try {
      // Usar mock se não tiver certificado configurado ou em ambiente de desenvolvimento
      const isDevelopment = process.env.NODE_ENV === 'development'
      const useRealSefaz = certificateConfigured && ambiente === "1"
      const endpoint = (isDevelopment || !useRealSefaz) ? '/api/nfe/mock-consultar' : '/api/nfe/consultar'
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chaveNfe: chaveInput.replace(/\D/g, ''),
          ambiente: parseInt(ambiente)
        }),
      })

      const data: ConsultaNfeResponse = await response.json()
      setResultado(data)

      if (data.success && data.data) {
        toast.success("Consulta realizada com sucesso!")
      } else if (data.error) {
        toast.error(data.error)
      }
    } catch (error) {
      console.error('Erro na consulta:', error)
      toast.error("Erro ao consultar NFe")
    } finally {
      setIsLoading(false)
    }
  }

  const copiarChave = () => {
    navigator.clipboard.writeText(chaveInput.replace(/\D/g, ''))
    toast.success("Chave copiada!")
  }

  const getStatusInfo = (codigo: string) => {
    return STATUS_NFE_MAP[codigo] || { 
      codigo, 
      descricao: `Status ${codigo}`, 
      cor: 'gray' as const 
    }
  }

  const getBadgeVariant = (cor: string) => {
    switch (cor) {
      case 'green': return 'default'
      case 'red': return 'destructive'
      case 'yellow': return 'secondary'
      case 'blue': return 'outline'
      default: return 'secondary'
    }
  }

  const carregarChaveTeste = () => {
    const chaveTeste = "35200214200166000187550010000000071123456789"
    setChaveInput(chaveTeste.replace(/(\d{4})(?=\d)/g, '$1 '))
    toast.info("Chave de teste carregada!")
  }

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* Gerenciador de Certificado */}
        <CertificateManager onCertificateChange={setCertificateConfigured} />
        {/* Formulário de Consulta */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Consultar NFe
            </CardTitle>
            <CardDescription>
              Digite a chave de acesso da NFe para consultar sua situação no SEFAZ
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="chave">Chave de Acesso NFe (44 dígitos)</Label>
              <div className="relative">
                <Input
                  id="chave"
                  placeholder="0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000"
                  value={chaveInput}
                  onChange={(e) => handleChaveChange(e.target.value)}
                  className={`font-mono ${
                    chaveInput.length > 0 
                      ? chaveValida 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-red-500 bg-red-50'
                      : ''
                  }`}
                />
                {chaveInput.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                    onClick={copiarChave}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                )}
              </div>
              {chaveInput.length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  {chaveValida ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className={chaveValida ? 'text-green-600' : 'text-red-600'}>
                    {chaveValida ? 'Chave válida' : 'Chave inválida'}
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ambiente">Ambiente</Label>
                <Select value={ambiente} onValueChange={(value: "1" | "2") => setAmbiente(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">Homologação</SelectItem>
                    <SelectItem value="1">Produção</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={carregarChaveTeste}
                  className="w-full"
                >
                  Carregar Chave de Teste
                </Button>
              </div>
            </div>

            <Button 
              onClick={consultarNfe} 
              disabled={!chaveValida || isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Consultando...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Consultar NFe
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Informações da Chave */}
        {chaveInfo && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Informações da Chave
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">UF</Label>
                  <p className="font-mono">{chaveInfo.uf}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Data Emissão</Label>
                  <p className="font-mono">{chaveInfo.dataEmissao}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">CNPJ Emitente</Label>
                  <p className="font-mono">{chaveInfo.cnpjEmitente}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Modelo</Label>
                  <p className="font-mono">{chaveInfo.modelo}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Série</Label>
                  <p className="font-mono">{chaveInfo.serie}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Número NFe</Label>
                  <p className="font-mono">{chaveInfo.numeroNF}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Resultado da Consulta */}
        {resultado && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Resultado da Consulta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {resultado.success && resultado.data ? (
                <div className="space-y-4">
                  {/* Status Principal */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                      <div className="flex items-center gap-2">
                        <Badge variant={getBadgeVariant(getStatusInfo(resultado.data.codigo).cor)}>
                          {getStatusInfo(resultado.data.codigo).descricao}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          (Código: {resultado.data.codigo})
                        </span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Detalhes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Situação</Label>
                      <p>{resultado.data.situacao}</p>
                    </div>
                    {resultado.data.protocolo && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Protocolo</Label>
                        <p className="font-mono">{resultado.data.protocolo}</p>
                      </div>
                    )}
                    {resultado.data.dataAutorizacao && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Data Autorização</Label>
                        <p>{formatarData(resultado.data.dataAutorizacao)}</p>
                      </div>
                    )}
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Consultado em</Label>
                      <p>{formatarData(resultado.timestamp)}</p>
                    </div>
                  </div>

                  {/* Dados da NFe se disponíveis */}
                  {resultado.data.nfeProc?.nfe?.infNFe && (
                    <>
                      <Separator />
                      <div className="space-y-4">
                        <h4 className="font-medium">Dados da Nota Fiscal</h4>
                        
                        {/* Emitente */}
                        {resultado.data.nfeProc.nfe.infNFe.emit && (
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Emitente</Label>
                            <div className="space-y-1">
                              <p>{resultado.data.nfeProc.nfe.infNFe.emit.xNome}</p>
                              {resultado.data.nfeProc.nfe.infNFe.emit.CNPJ && (
                                <p className="text-sm text-muted-foreground font-mono">
                                  {formatarDocumento(resultado.data.nfeProc.nfe.infNFe.emit.CNPJ)}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Destinatário */}
                        {resultado.data.nfeProc.nfe.infNFe.dest && (
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Destinatário</Label>
                            <div className="space-y-1">
                              <p>{resultado.data.nfeProc.nfe.infNFe.dest.xNome}</p>
                              <p className="text-sm text-muted-foreground font-mono">
                                {formatarDocumento(
                                  resultado.data.nfeProc.nfe.infNFe.dest.CNPJ || 
                                  resultado.data.nfeProc.nfe.infNFe.dest.CPF || ''
                                )}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Valores */}
                        {resultado.data.nfeProc.nfe.infNFe.total?.ICMSTot && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {resultado.data.nfeProc.nfe.infNFe.total.ICMSTot.vNF && (
                              <div>
                                <Label className="text-sm font-medium text-muted-foreground">Valor Total</Label>
                                <p className="text-lg font-semibold">
                                  {formatarValor(resultado.data.nfeProc.nfe.infNFe.total.ICMSTot.vNF)}
                                </p>
                              </div>
                            )}
                            {resultado.data.nfeProc.nfe.infNFe.total.ICMSTot.vICMS && (
                              <div>
                                <Label className="text-sm font-medium text-muted-foreground">Valor ICMS</Label>
                                <p className="text-lg font-semibold">
                                  {formatarValor(resultado.data.nfeProc.nfe.infNFe.total.ICMSTot.vICMS)}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {resultado.error || 'Erro na consulta'}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}