"use client"

import React, { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { 
  Upload, 
  Shield, 
  ShieldCheck, 
  ShieldX, 
  FileKey, 
  Trash2, 
  Loader2,
  AlertTriangle,
  CheckCircle,
  Info
} from "lucide-react"
import { toast } from "sonner"
import { CertificateInfo } from "@/lib/certificate-types"

interface CertificateManagerProps {
  onCertificateChange?: (isConfigured: boolean) => void
}

export function CertificateManager({ onCertificateChange }: CertificateManagerProps) {
  const [certificateFile, setCertificateFile] = useState<File | null>(null)
  const [password, setPassword] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [certificateInfo, setCertificateInfo] = useState<CertificateInfo | null>(null)
  const [isConfigured, setIsConfigured] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Carregar status do certificado ao montar componente
  useEffect(() => {
    loadCertificateStatus()
  }, [])

  const loadCertificateStatus = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/nfe/certificate/upload')
      const data = await response.json()
      
      if (data.success) {
        setIsConfigured(data.data.isConfigured)
        setCertificateInfo(data.data.info)
        onCertificateChange?.(data.data.isConfigured)
      }
    } catch (error) {
      console.error('Erro ao carregar status do certificado:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Verificar extensão
      const fileName = file.name.toLowerCase()
      if (!fileName.endsWith('.pfx') && !fileName.endsWith('.p12')) {
        toast.error("Apenas arquivos .pfx ou .p12 são aceitos")
        return
      }
      
      // Verificar tamanho (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Arquivo deve ter no máximo 5MB")
        return
      }
      
      setCertificateFile(file)
      toast.success("Certificado selecionado: " + file.name)
    }
  }

  const uploadCertificate = async () => {
    if (!certificateFile || !password) {
      toast.error("Selecione um certificado e informe a senha")
      return
    }

    setIsUploading(true)
    
    try {
      const formData = new FormData()
      formData.append('certificate', certificateFile)
      formData.append('password', password)

      const response = await fetch('/api/nfe/certificate/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        setCertificateInfo(data.data.info)
        setIsConfigured(true)
        setCertificateFile(null)
        setPassword("")
        onCertificateChange?.(true)
        
        toast.success("Certificado configurado com sucesso!")
        
        // Limpar input de arquivo
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      } else {
        toast.error(data.error || "Erro ao configurar certificado")
      }
    } catch (error) {
      console.error('Erro no upload:', error)
      toast.error("Erro ao enviar certificado")
    } finally {
      setIsUploading(false)
    }
  }

  const removeCertificate = async () => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/nfe/certificate/upload', {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        setCertificateInfo(null)
        setIsConfigured(false)
        onCertificateChange?.(false)
        toast.success("Certificado removido com sucesso!")
      } else {
        toast.error(data.error || "Erro ao remover certificado")
      }
    } catch (error) {
      console.error('Erro ao remover:', error)
      toast.error("Erro ao remover certificado")
    } finally {
      setIsLoading(false)
    }
  }

  const getCertificateStatusBadge = () => {
    if (!isConfigured) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <ShieldX className="h-3 w-3" />
          Não configurado
        </Badge>
      )
    }

    if (!certificateInfo?.isValid) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <ShieldX className="h-3 w-3" />
          Expirado
        </Badge>
      )
    }

    return (
      <Badge variant="default" className="flex items-center gap-1 bg-green-600">
        <ShieldCheck className="h-3 w-3" />
        Ativo
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Carregando status do certificado...
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Status do Certificado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Status do Certificado Digital
          </CardTitle>
          <CardDescription>
            Certificado necessário para consultas em produção no SEFAZ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getCertificateStatusBadge()}
              {isConfigured && certificateInfo && (
                <span className="text-sm text-muted-foreground">
                  {certificateInfo.name}
                </span>
              )}
            </div>
            
            {isConfigured && (
              <Button
                variant="outline"
                size="sm"
                onClick={removeCertificate}
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Remover
              </Button>
            )}
          </div>

          {/* Detalhes do Certificado */}
          {isConfigured && certificateInfo && (
            <div className="mt-4 space-y-3">
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Titular</Label>
                  <p className="font-mono text-xs break-all">{certificateInfo.subject}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Emissor</Label>
                  <p className="font-mono text-xs break-all">{certificateInfo.issuer}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Válido de</Label>
                  <p>{new Date(certificateInfo.validFrom).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Válido até</Label>
                  <p>{new Date(certificateInfo.validTo).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Número de Série</Label>
                  <p className="font-mono text-xs">{certificateInfo.serialNumber}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Impressão Digital</Label>
                  <p className="font-mono text-xs break-all">{certificateInfo.fingerprint}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload de Certificado */}
      {!isConfigured && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileKey className="h-5 w-5" />
              Configurar Certificado Digital
            </CardTitle>
            <CardDescription>
              Faça upload do seu certificado digital (.pfx ou .p12) para habilitar consultas em produção
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Importante:</strong> Seu certificado é processado localmente e não é armazenado permanentemente. 
                Você precisará configurá-lo novamente a cada reinicialização do sistema.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div>
                <Label htmlFor="certificate-file">Arquivo do Certificado (.pfx ou .p12)</Label>
                <Input
                  ref={fileInputRef}
                  id="certificate-file"
                  type="file"
                  accept=".pfx,.p12"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
                {certificateFile && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Arquivo selecionado: {certificateFile.name}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="certificate-password">Senha do Certificado</Label>
                <Input
                  id="certificate-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite a senha do certificado"
                />
              </div>

              <Button 
                onClick={uploadCertificate}
                disabled={!certificateFile || !password || isUploading}
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Configurando Certificado...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Configurar Certificado
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  )
}