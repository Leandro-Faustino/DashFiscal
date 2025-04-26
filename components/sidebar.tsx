"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Upload, Receipt, Settings, LogOut, Building2, ChevronRight, X } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { useSidebar } from "@/context/sidebar-context"

const routes = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/',
    color: "text-green-500"
  },
  {
    label: 'Empresa',
    icon: Building2,
    href: '/company',
    color: "text-indigo-500"
  },
  {
    label: 'Upload',
    icon: Upload,
    href: '/upload',
    color: "text-blue-500"
  },
  {
    label: 'Notas Fiscais',
    icon: Receipt,
    href: '/invoices',
    color: "text-yellow-500"
  },
  {
    label: 'Configurações',
    icon: Settings,
    href: '/settings',
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const { isCollapsed } = useSidebar();
  
  // Fechar o menu móvel ao mudar de tamanho de tela
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {/* Botão do menu móvel - visível apenas em telas pequenas */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-3 left-3 z-50 md:hidden text-slate-600 bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white border-0"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        <ChevronRight className={cn("h-5 w-5", isMobileOpen ? "rotate-180" : "")} />
      </Button>
      
      {/* Overlay escuro quando o menu móvel está aberto */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
      
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 transform transition-all duration-300 ease-in-out bg-[#217346] h-full",
        isMobileOpen ? "translate-x-0 w-3/4 max-w-xs" : "-translate-x-full",
        "md:relative md:translate-x-0",
        isCollapsed ? "md:w-16" : "md:w-72",
      )}>
        {/* Botão para fechar no mobile */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-3 right-3 md:hidden text-white hover:bg-white/10 border-0"
          onClick={() => setIsMobileOpen(false)}
        >
          <X className="h-5 w-5" />
        </Button>
        
        <div className="flex flex-col h-full text-white">
          {/* Logo - no topo absoluto */}
          <Link 
            href="/" 
            className={cn(
              "flex items-center h-16 justify-center",
              isCollapsed ? "" : "px-4"
            )}
          >
            {isCollapsed ? (
              <div className="text-2xl font-bold">FP</div>
            ) : (
              <h1 className="text-2xl font-bold">Finance Pro</h1>
            )}
          </Link>
          
          {/* Conteúdo principal */}
          <div className="flex-1 px-3 py-2">
            <div className="space-y-1">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "text-sm group flex p-3 w-full font-medium cursor-pointer hover:bg-white/10 rounded-lg transition",
                    pathname === route.href ? "bg-white/10" : "transparent",
                    isCollapsed ? "justify-center" : "justify-start"
                  )}
                  title={isCollapsed ? route.label : ""}
                >
                  <div className={cn(
                    "flex items-center",
                    isCollapsed ? "justify-center" : "flex-1"
                  )}>
                    <route.icon className={cn(
                      "h-5 w-5",
                      isCollapsed ? "" : "mr-3",
                      route.color
                    )} />
                    {!isCollapsed && <span>{route.label}</span>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
          
          {/* Botão de logout no final */}
          <div className={cn(
            "px-3 py-2 mt-auto mb-2",
            isCollapsed ? "flex justify-center" : ""
          )}>
            <Button 
              variant="ghost" 
              size={isCollapsed ? "icon" : "lg"} 
              className={cn(
                "text-white hover:bg-white/10 border-0",
                isCollapsed ? "w-10 h-10" : "w-full justify-start"
              )} 
              onClick={() => {}}
              title={isCollapsed ? "Logout" : ""}
            >
              <LogOut className={isCollapsed ? "h-5 w-5" : "mr-3 h-5 w-5"} />
              {!isCollapsed && "Logout"}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}