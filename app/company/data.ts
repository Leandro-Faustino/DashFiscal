export type Company = {
  id: string;
  name: string;
  cnpj: string;
  address: string;
  created_at: Date;
};

export const companies: Company[] = [
  {
    id: "1",
    name: "Empresa ABC Ltda",
    cnpj: "12.345.678/0001-90",
    address: "Rua das Flores, 123 - São Paulo/SP",
    created_at: new Date("2023-01-15")
  },
  {
    id: "2",
    name: "Comercial XYZ S.A.",
    cnpj: "98.765.432/0001-21",
    address: "Av. Paulista, 1000 - São Paulo/SP",
    created_at: new Date("2023-02-22")
  },
  {
    id: "3",
    name: "Distribuidora Rápida ME",
    cnpj: "45.678.901/0001-34",
    address: "Rua Dom Pedro II, 567 - Rio de Janeiro/RJ",
    created_at: new Date("2023-03-10")
  },
  {
    id: "4",
    name: "Tech Solutions Ltda",
    cnpj: "56.789.012/0001-45",
    address: "Av. Brasil, 789 - Belo Horizonte/MG",
    created_at: new Date("2023-04-05")
  },
  {
    id: "5",
    name: "Indústria Nacional S.A.",
    cnpj: "34.567.890/0001-67",
    address: "Rua Industrial, 456 - Curitiba/PR",
    created_at: new Date("2023-05-18")
  },
  {
    id: "6",
    name: "Mercado Central EIRELI",
    cnpj: "23.456.789/0001-12",
    address: "Av. Central, 789 - Porto Alegre/RS",
    created_at: new Date("2023-06-20")
  },
  {
    id: "7",
    name: "Fábrica de Móveis Confort",
    cnpj: "67.890.123/0001-45",
    address: "Rua dos Marceneiros, 123 - Salvador/BA",
    created_at: new Date("2023-07-05")
  },
  {
    id: "8",
    name: "Supermercados Unidos Ltda",
    cnpj: "78.901.234/0001-56",
    address: "Av. dos Alimentos, 456 - Fortaleza/CE",
    created_at: new Date("2023-08-15")
  },
  {
    id: "9",
    name: "Consultoria Financeira Ltda",
    cnpj: "89.012.345/0001-67",
    address: "Rua das Finanças, 789 - Recife/PE",
    created_at: new Date("2023-09-10")
  },
  {
    id: "10",
    name: "Farmácia Saúde Total",
    cnpj: "90.123.456/0001-78",
    address: "Av. da Saúde, 123 - Brasília/DF",
    created_at: new Date("2023-10-05")
  },
  {
    id: "11",
    name: "Construtora Horizonte",
    cnpj: "01.234.567/0001-89",
    address: "Rua dos Construtores, 456 - Manaus/AM",
    created_at: new Date("2023-11-20")
  },
  {
    id: "12",
    name: "Transporte Expresso Ltda",
    cnpj: "12.345.678/0002-71",
    address: "Av. dos Transportes, 789 - Goiânia/GO",
    created_at: new Date("2023-12-15")
  }
]; 