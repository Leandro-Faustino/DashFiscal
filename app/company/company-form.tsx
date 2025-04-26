"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const formSchema = z.object({
  name: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres" }),
  cnpj: z.string().regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/, { message: "CNPJ inválido. Use o formato: XX.XXX.XXX/XXXX-XX" }),
  address: z.string().min(5, { message: "Endereço deve ter pelo menos 5 caracteres" }),
})

type CompanyFormValues = z.infer<typeof formSchema>

interface CompanyFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit?: (data: CompanyFormValues) => void
}

export function CompanyForm({ open, onOpenChange, onSubmit }: CompanyFormProps) {
  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      cnpj: "",
      address: "",
    },
  })

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      form.reset();
    }
  }, [open, form]);

  function handleSubmit(data: CompanyFormValues) {
    onSubmit?.(data)
    form.reset()
    onOpenChange(false)
  }

  // Função para formatar o CNPJ enquanto o usuário digita
  function formatCNPJ(value: string) {
    // Remove todos os caracteres não numéricos
    const cnpjDigits = value.replace(/\D/g, "");
    
    // Aplica a máscara conforme o usuário digita
    let formattedCnpj = "";
    if (cnpjDigits.length <= 2) {
      formattedCnpj = cnpjDigits;
    } else if (cnpjDigits.length <= 5) {
      formattedCnpj = `${cnpjDigits.slice(0, 2)}.${cnpjDigits.slice(2)}`;
    } else if (cnpjDigits.length <= 8) {
      formattedCnpj = `${cnpjDigits.slice(0, 2)}.${cnpjDigits.slice(2, 5)}.${cnpjDigits.slice(5)}`;
    } else if (cnpjDigits.length <= 12) {
      formattedCnpj = `${cnpjDigits.slice(0, 2)}.${cnpjDigits.slice(2, 5)}.${cnpjDigits.slice(5, 8)}/${cnpjDigits.slice(8)}`;
    } else {
      formattedCnpj = `${cnpjDigits.slice(0, 2)}.${cnpjDigits.slice(2, 5)}.${cnpjDigits.slice(5, 8)}/${cnpjDigits.slice(8, 12)}-${cnpjDigits.slice(12, 14)}`;
    }
    
    return formattedCnpj;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Cadastrar Nova Empresa</DialogTitle>
          <DialogDescription>
            Preencha os dados da empresa que deseja cadastrar no sistema.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Empresa</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome da empresa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cnpj"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CNPJ</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="XX.XXX.XXX/XXXX-XX" 
                      value={field.value}
                      onChange={(e) => {
                        const formattedValue = formatCNPJ(e.target.value);
                        field.onChange(formattedValue);
                      }}
                      maxLength={18}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço</FormLabel>
                  <FormControl>
                    <Input placeholder="Endereço completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 