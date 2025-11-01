import { 
  Home, 
  Users, 
  Wrench, 
  ClipboardList, 
  Package, 
  Shield, 
  Receipt,
  Settings
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from 'react-i18next';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const navigationItems = [
  { titleKey: "dashboard", url: "/", icon: Home },
  { titleKey: "customers", url: "/asiakkaat", icon: Users },
  { titleKey: "devices", url: "/laitteet", icon: Wrench },
  { titleKey: "services", url: "/huollot", icon: ClipboardList },
  { titleKey: "invoicing", url: "/laskutus", icon: Receipt },
  { titleKey: "inventory", url: "/varasto", icon: Package },
  { titleKey: "warranty", url: "/takuu", icon: Shield },
  { titleKey: "settings", url: "/asetukset", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const { t } = useTranslation(['sidebar']);

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary text-primary-foreground font-medium" : "hover:bg-secondary";

  return (
    <Sidebar className={state === "collapsed" ? "w-14" : "w-64"} collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-semibold text-primary px-4 py-2">
            {state !== "collapsed" && t('sidebar:appName')}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.titleKey}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.url === "/"}
                      className={({ isActive }) => getNavCls({ isActive })}
                    >
                      <item.icon className="h-4 w-4" />
                      {state !== "collapsed" && <span>{t(`sidebar:${item.titleKey}`)}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}