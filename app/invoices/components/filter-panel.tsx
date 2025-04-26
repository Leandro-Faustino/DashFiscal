"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon, Filter, X } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface FilterPanelProps {
  onApplyFilters: (filters: FilterValues) => void
  onResetFilters: () => void
}

export interface FilterValues {
  startDate: Date | undefined
  endDate: Date | undefined
  cnpj: string
  statusFilter: 'all' | 'ok' | 'warning' | 'error'
  onlyIssues: boolean
}

export function FilterPanel({ onApplyFilters, onResetFilters }: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [cnpj, setCnpj] = useState("")
  const [statusFilter, setStatusFilter] = useState<'all' | 'ok' | 'warning' | 'error'>('all')
  const [onlyIssues, setOnlyIssues] = useState(false)
  
  const handleApplyFilters = () => {
    onApplyFilters({
      startDate,
      endDate,
      cnpj,
      statusFilter,
      onlyIssues
    })
    setIsOpen(false)
  }
  
  const handleResetFilters = () => {
    setStartDate(undefined)
    setEndDate(undefined)
    setCnpj("")
    setStatusFilter('all')
    setOnlyIssues(false)
    onResetFilters()
    setIsOpen(false)
  }
  
  const formatCNPJ = (value: string) => {
    // Remove qualquer caractere que não seja número
    const numericValue = value.replace(/\D/g, '')
    
    // Aplica a máscara XX.XXX.XXX/XXXX-XX
    return numericValue
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1')
  }
  
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1">
              <Filter className="h-3.5 w-3.5" />
              <span>Filtros</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Filtrar resultados</h4>
                <p className="text-sm text-muted-foreground">
                  Ajuste os filtros para encontrar notas específicas
                </p>
              </div>
              
              <div className="grid gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="grid gap-1.5">
                    <Label htmlFor="date-from">Data inicial</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="date-from"
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? (
                            format(startDate, "dd/MM/yyyy")
                          ) : (
                            <span>Selecione</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          initialFocus
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="grid gap-1.5">
                    <Label htmlFor="date-to">Data final</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="date-to"
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !endDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? (
                            format(endDate, "dd/MM/yyyy")
                          ) : (
                            <span>Selecione</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          initialFocus
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                <div className="grid gap-1.5">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    placeholder="XX.XXX.XXX/XXXX-XX"
                    value={cnpj}
                    onChange={(e) => setCnpj(formatCNPJ(e.target.value))}
                  />
                </div>
                
                <div className="grid gap-1.5">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={statusFilter} 
                    onValueChange={(value) => setStatusFilter(value as any)}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="ok">Validados com Sucesso</SelectItem>
                      <SelectItem value="warning">Com Alertas</SelectItem>
                      <SelectItem value="error">Com Erros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2 mt-2">
                  <Checkbox 
                    id="only-issues" 
                    checked={onlyIssues}
                    onCheckedChange={(checked) => 
                      setOnlyIssues(checked as boolean)
                    }
                  />
                  <Label 
                    htmlFor="only-issues"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Mostrar apenas notas com divergências
                  </Label>
                </div>
              </div>
              
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleResetFilters}
                  className="gap-1"
                >
                  <X className="h-3.5 w-3.5" />
                  <span>Limpar</span>
                </Button>
                <Button size="sm" onClick={handleApplyFilters}>
                  Aplicar Filtros
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
} 