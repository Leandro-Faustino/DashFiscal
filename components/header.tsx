import { ChevronLeft, ChevronRight, Menu } from "lucide-react"
import { Button } from "./ui/button"
import { useSidebar } from "@/context/sidebar-context"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import { ThemeToggle } from "./theme-toggle"

// Função para obter o título da página atual
function getPageTitle(path: string): string {
  const routes: Record<string, string> = {
    '/': 'Dashboard',
    '/company': 'Empresas',
    '/upload': 'Upload',
    '/invoices': 'Notas Fiscais',
    '/settings': 'Configurações',
  };
  
  return routes[path] || 'Conciliação Fiscal';
}

export function Header() {
  const { isCollapsed, toggleCollapsed } = useSidebar();
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);
  
  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 sm:px-6">
        {/* Toggle button - escondido no mobile */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCollapsed}
          className="hidden md:flex mr-4 hover:bg-slate-100 dark:hover:bg-green-950/40 transition-colors"
          aria-label={isCollapsed ? "Expandir menu" : "Recolher menu"}
          title={isCollapsed ? "Expandir menu" : "Recolher menu"}
        >
          {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
        
        {/* Título da página - ajustado para mobile */}
        <div className="flex items-center ml-12 md:ml-0">
          <span className="text-lg font-semibold md:hidden">
            {pageTitle}
          </span>
          <span className={cn(
            "hidden md:block text-lg font-semibold transition-all duration-300",
            isCollapsed 
              ? "opacity-100 translate-x-0" 
              : "opacity-0 -translate-x-4"
          )}>
            {pageTitle}
          </span>
        </div>
        
        <div className="ml-auto flex items-center space-x-2 sm:space-x-4">
          <ThemeToggle />
          <div className="h-8 w-8 rounded-full bg-green-500 grid place-items-center">
            <span className="text-sm font-medium text-white">JD</span>
          </div>
        </div>
      </div>
    </div>
  )
}