import { Bell, ChevronLeft, ChevronRight, Menu } from "lucide-react"
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
  
  return routes[path] || 'Finance Pro';
}

export function Header() {
  const { isCollapsed, toggleCollapsed } = useSidebar();
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);
  
  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 sm:px-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCollapsed}
          className="mr-4 hover:bg-slate-100 dark:hover:bg-green-950/40 transition-colors"
          aria-label={isCollapsed ? "Expandir menu" : "Recolher menu"}
          title={isCollapsed ? "Expandir menu" : "Recolher menu"}
        >
          {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
        
        <div className="flex items-center">
          <span className={cn(
            "text-lg font-semibold transition-all duration-300",
            isCollapsed 
              ? "opacity-100 translate-x-0" 
              : "opacity-0 -translate-x-4 md:hidden"
          )}>
            {pageTitle}
          </span>
        </div>
        
        <div className="ml-auto flex items-center space-x-4">
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white grid place-items-center">
              3
            </span>
          </Button>
          <div className="h-8 w-8 rounded-full bg-green-500 grid place-items-center">
            <span className="text-sm font-medium text-white">JD</span>
          </div>
        </div>
      </div>
    </div>
  )
}