"use client"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { FileText, Home, Upload, LogOut, Settings, Headphones, BarChart2, ChevronRight, Settings2Icon } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { jwtDecode } from "jwt-decode"

export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [login, setLogin] = useState(false)
  const [userName, setUserName] = useState("User")
  const [userEmail, setUserEmail] = useState("john@example.com")
  const [role, setRole] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [collapsed, setCollapsed] = useState(true)
  
  // Helper to get token from cookies
  function getTokenFromCookies() {
    const match = document.cookie.match(new RegExp('(^| )token=([^;]+)'));
    return match ? match[2] : null;
  }

  useEffect(() => {
    if (pathname === "/login" || pathname === "/") {
      setLogin(true)
    } else {
      setLogin(false)
    }

    // Get user info from token
    const token = getTokenFromCookies();
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        setUserEmail(decoded.sub || "john@example.com");
        setRole(decoded.role || "");
      } catch (e) {
        setUserEmail("john@example.com");
        setRole("");
      }
    } else {
      setUserEmail("john@example.com");
      setRole("");
    }
  }, [pathname])
  
  if (login) {
    return null
  }
  
  const handleLogout = () => {
    document.cookie = "token=; max-age=0; path=/;"
    router.push("/login")
  }
  
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
  
  const truncateName = (name) => {
    return name.length > 15 ? name.substring(0, 15) + '...' : name;
  }

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  }

  const mainRoutes = [
    { title: "Reports", icon: FileText, href: "/reports", badge: null },
    { title: "Upload", icon: Upload, href: "/upload", badge: null },
    ...(role === "superadmin"
      ? [{ title: "Admin", icon: Settings2Icon, href: "/admin", badge: null }]
      : []),
  ]
  
  return (
    <Sidebar className={cn(
      "transition-all duration-300 ease-in-out",
      collapsed ? "w-20" : "w-40",
      "bg-background/60 backdrop-blur-xl border-r border-white/10 shadow-lg",
      "dark:bg-black/40 dark:border-white/5"
    )}>
      <SidebarHeader className="border-b border-white/10 dark:border-white/5">
        <div className="flex h-16 items-center px-5 justify-between">
          <Link href="/" className={cn(
            "flex items-center gap-2 font-medium transition-opacity",
            collapsed && "justify-center"
          )}>
            <div className="flex items-center justify-center h-8 w-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20">
              <Headphones className="h-5 w-5" />
            </div>
            {!collapsed && <span className="text-xl tracking-tight font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-500">CitrusIQ</span>}
          </Link>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleCollapse}
            className="rounded-full h-8 w-8 hover:bg-white/10 dark:hover:bg-white/5"
          >
            <ChevronRight className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              collapsed ? "rotate-180" : "rotate-0"
            )} />
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent className="py-4">
        <div className={cn(
          "px-3 py-2",
          collapsed && "px-2"
        )}>
          {!collapsed && <p className="text-xs font-medium text-muted-foreground/70 px-2 py-1.5 ml-1">MAIN</p>}
          <SidebarMenu>
            {mainRoutes.map((route) => (
              <SidebarMenuItem key={route.href}>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <SidebarMenuButton asChild 
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                          pathname === route.href 
                            ? "bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-500 dark:text-blue-400 border-l-2 border-blue-500" 
                            : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                          collapsed && "justify-center px-0"
                        )}
                      >
                        <Link href={route.href} className={cn(
                          "flex items-center gap-3 w-full",
                          collapsed && "justify-center"
                        )}>
                          <div className={cn(
                            "flex items-center justify-center w-8 h-8 rounded-lg",
                            pathname === route.href 
                              ? "bg-blue-500/10 text-blue-500 dark:text-blue-400" 
                              : "text-muted-foreground"
                          )}>
                            <route.icon className={cn(
                              "flex-shrink-0",
                              pathname === route.href ? "h-5 w-5" : "h-4 w-4"
                            )} />
                          </div>
                          
                          {!collapsed && (
                            <div className="flex items-center justify-between w-full">
                              <span>{route.title}</span>
                              {route.badge && (
                                <Badge variant="default" className="ml-auto h-8 bg-blue-500 hover:bg-blue-600">
                                  {route.badge}
                                </Badge>
                              )}
                            </div>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </TooltipTrigger>
                    {collapsed && (
                      <TooltipContent side="right">
                        <div className="flex items-center gap-2">
                          <span>{route.title}</span>
                          {route.badge && (
                            <Badge variant="default" className="h-8 bg-blue-500">
                              {route.badge}
                            </Badge>
                          )}
                        </div>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
          
          <Separator className="my-4 opacity-20 mx-2 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent" />
          
          {/* {!collapsed && <p className="text-xs font-medium text-muted-foreground/70 px-2 py-1.5 ml-1">UTILITIES</p>} */}
          {/* <SidebarMenu>
            {utilityRoutes.map((route) => (
              <SidebarMenuItem key={route.href}>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <SidebarMenuButton asChild 
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                          pathname === route.href 
                            ? "bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-500 dark:text-blue-400 border-l-2 border-blue-500" 
                            : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                          collapsed && "justify-center px-0"
                        )}
                      >
                        <Link href={route.href} className={cn(
                          "flex items-center gap-3 w-full",
                          collapsed && "justify-center"
                        )}>
                          <div className={cn(
                            "flex items-center justify-center w-8 h-8 rounded-lg",
                            pathname === route.href 
                              ? "bg-blue-500/10 text-blue-500 dark:text-blue-400" 
                              : "text-muted-foreground"
                          )}>
                            <route.icon className={cn(
                              "flex-shrink-0",
                              pathname === route.href ? "h-5 w-5" : "h-4 w-4"
                            )} />
                          </div>
                          
                          {!collapsed && (
                            <span>{route.title}</span>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </TooltipTrigger>
                    {collapsed && (
                      <TooltipContent side="right">
                        {route.title}
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </SidebarMenuItem>
            ))}
          </SidebarMenu> */}
        </div>
      </SidebarContent>

      <SidebarFooter className="border-t border-white/10 dark:border-white/5">
        <div className={cn(
          "p-4",
          collapsed && "p-2"
        )}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={cn(
                  "flex items-center gap-3 mb-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors",
                  collapsed && "justify-center p-2 mb-2"
                )}>
                  <Avatar className="h-10 w-10 flex-shrink-0 border border-white/10 shadow-sm">
                    <AvatarImage src={imageUrl} alt={userName} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 text-blue-500 text-sm font-medium">{getInitials(userName)}</AvatarFallback>
                  </Avatar>

                  {!collapsed && (
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {truncateName(userName)}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {userEmail}
                      </p>
                    </div>
                  )}
                  
                  {!collapsed && <ModeToggle />}
                </div>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right" className="min-w-52">
                  <div className="flex flex-col gap-1">
                    <p className="font-medium">{userName}</p>
                    <p className="text-xs text-muted-foreground">{userEmail}</p>
                  </div>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>

          <Button 
            onClick={handleLogout} 
            variant="ghost" 
            className={cn(
              "w-full justify-start text-sm font-normal border border-white/10 bg-white/5 hover:bg-white/10 hover:text-destructive transition-colors shadow-sm",
              collapsed && "justify-center px-0 aspect-square"
            )}
          >
            <LogOut className={cn(
              "h-4 w-4 opacity-70",
              collapsed ? "mr-0" : "mr-2"
            )} />
            {!collapsed && "Sign Out"}
          </Button>
        </div>
      </SidebarFooter>
      <SidebarTrigger />
    </Sidebar>
  )
}