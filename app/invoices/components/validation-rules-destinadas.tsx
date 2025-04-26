"use client"

import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"

export function ValidationRulesDestinadas() {
  return (
    <Accordion type="single" collapsible className="mb-6">
      <AccordionItem value="regras">
        <AccordionTrigger>Regras de Validação</AccordionTrigger>
        <AccordionContent>
          <div className="mb-4 text-sm">
            <p className="mb-2">Regras para validação entre planilhas SAT (Destinadas) e Questor Entradas:</p>
            
            <h4 className="font-medium mt-3 mb-1">Campos Obrigatórios na Planilha SAT</h4>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campo</TableHead>
                    <TableHead>Valor Esperado</TableHead>
                    <TableHead>Regra</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>ModeloDocumento</TableCell>
                    <TableCell>55</TableCell>
                    <TableCell>-</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>TipoDocumento</TableCell>
                    <TableCell>Nfe</TableCell>
                    <TableCell>-</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>TipoDeOperacaoEntradaOuSaida</TableCell>
                    <TableCell>S</TableCell>
                    <TableCell>Se for "E" deve apresentar a mensagem: "NOTA FISCAL ENTRADA FORNECEDOR NÃO DEVE SER ESCRITURADA - VERIFICAR"</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Situacao</TableCell>
                    <TableCell>Autorizado</TableCell>
                    <TableCell>Se for "CANCELADA" não deve ter na planilha Questor. Se encontrar deve apresentar a mensagem: "NOTA CANCELADA, NÃO DEVE SER ESCRITURADA"</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            
            <h4 className="font-medium mt-5 mb-1">Correspondência entre Campos</h4>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SAT Destinadas</TableHead>
                    <TableHead>Questor Entradas</TableHead>
                    <TableHead>Regra de Validação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>NumeroDocumento</TableCell>
                    <TableCell>Número</TableCell>
                    <TableCell>Deve ser igual</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>SerieDocumento</TableCell>
                    <TableCell>Série</TableCell>
                    <TableCell>Deve ser igual</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>DataEmissao</TableCell>
                    <TableCell>Data Escrituração/Serviço</TableCell>
                    <TableCell>Deve ser igual</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>CnpjOuCpfDoEmitente</TableCell>
                    <TableCell>CNPJ EMITENTE</TableCell>
                    <TableCell>Deve ser igual</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>CnpjOuCpfDoDestinatario</TableCell>
                    <TableCell>CNPJ DESTINATARIO</TableCell>
                    <TableCell>Deve ser igual</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>UfDestinatario</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Deve ser igual</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>ValorTotalNota</TableCell>
                    <TableCell>Valor Total + Valor IPI</TableCell>
                    <TableCell>Soma dos campos com mesmo NumeroDocumento/Serie</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>ValorTotalICMS</TableCell>
                    <TableCell>Valor ICMS</TableCell>
                    <TableCell>Soma dos campos com mesmo NumeroDocumento/Serie</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>ValorBaseCalculoICMS</TableCell>
                    <TableCell>Base Cálculo ICMS</TableCell>
                    <TableCell>Soma dos campos com mesmo NumeroDocumento/Serie</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>ValorBaseCalculoICMSST</TableCell>
                    <TableCell>Base Cálculo Substituição Tributária</TableCell>
                    <TableCell>Soma dos campos com mesmo NumeroDocumento/Serie</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>ValorTotalICMSST</TableCell>
                    <TableCell>Valor Substituição Tributária</TableCell>
                    <TableCell>Soma dos campos com mesmo NumeroDocumento/Serie</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>ValorFrete</TableCell>
                    <TableCell>Valor Frete</TableCell>
                    <TableCell>Soma dos campos com mesmo NumeroDocumento/Serie</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>ValorSeguro</TableCell>
                    <TableCell>Valor Seguro</TableCell>
                    <TableCell>Soma dos campos com mesmo NumeroDocumento/Serie</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>ValorDespesaAcessoria</TableCell>
                    <TableCell>Valor Despesa Acessória</TableCell>
                    <TableCell>Soma dos campos com mesmo NumeroDocumento/Serie</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>ValorDesconto</TableCell>
                    <TableCell>Valor Desconto</TableCell>
                    <TableCell>Soma dos campos com mesmo NumeroDocumento/Serie</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>ValorIPI</TableCell>
                    <TableCell>Valor IPI</TableCell>
                    <TableCell>Soma dos campos com mesmo NumeroDocumento/Serie</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>ValorTotalIpiDevolvA58</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>Se valor {'>'} 0, mostrar mensagem: "VERIFICAR VALOR DE IPI EM COMPLEMENTARES"</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>ValorPis</TableCell>
                    <TableCell>Valor PIS</TableCell>
                    <TableCell>Soma dos campos com mesmo NumeroDocumento/Serie</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>ValorCofins</TableCell>
                    <TableCell>Valor COFINS</TableCell>
                    <TableCell>Soma dos campos com mesmo NumeroDocumento/Serie</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            
            <h4 className="font-medium mt-5 mb-1">Exemplo</h4>
            <p className="mb-2">Para a NF 9909:</p>
            <ul className="list-disc pl-5 space-y-1 mb-2">
              <li>SAT: ValorTotalNota = R$ 372.284,96</li>
              <li>Questor: Valor Total = R$ 360.566,55 + Valor IPI = R$ 11.718,41 = R$ 372.284,96</li>
              <li>Validação: Valores iguais ✓</li>
            </ul>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
} 