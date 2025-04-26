"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Filter, X } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface FilterPanelProps {
  onApplyFilters: (filters: FilterValues) => void
  onResetFilters: () => void
}

export interface FilterValues {
  documentNumber: string
}

export function FilterPanel({ onApplyFilters, onResetFilters }: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [documentNumber, setDocumentNumber] = useState("")
  
  const handleApplyFilters = () => {
    onApplyFilters({
      documentNumber
    })
    setIsOpen(false)
  }
  
  const handleResetFilters = () => {
    setDocumentNumber("")
    onResetFilters()
    setIsOpen(false)
  }
  
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1">
              <Filter className="h-3.5 w-3.5" />
              <span>Filtrar</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Filtrar NF-e</h4>
                <p className="text-sm text-muted-foreground">
                  Informe o número do documento para localizar uma nota fiscal específica
                </p>
              </div>
              
              <div className="grid gap-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="documentNumber">Número do Documento</Label>
                  <Input
                    id="documentNumber"
                    placeholder="Digite o número da NF-e"
                    value={documentNumber}
                    onChange={(e) => setDocumentNumber(e.target.value)}
                  />
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
                <Button 
                  size="sm" 
                  onClick={handleApplyFilters}
                  disabled={!documentNumber.trim()}
                >
                  Aplicar Filtro
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
} 