import { ReactNode } from "react";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Shield } from "lucide-react";

interface ProtectedActionProps {
  children: ReactNode;
  requireAdmin?: boolean;
  requireTeknikko?: boolean;
  requireAny?: boolean; // Admin OR Teknikko
  fallback?: ReactNode;
  showTooltip?: boolean;
  tooltipMessage?: string;
}

export function ProtectedAction({
  children,
  requireAdmin = false,
  requireTeknikko = false,
  requireAny = false,
  fallback = null,
  showTooltip = true,
  tooltipMessage,
}: ProtectedActionProps) {
  const { isAdmin, isTeknikko, isLoading } = useUserPermissions();

  if (isLoading) {
    return null;
  }

  let hasPermission = false;

  if (requireAny) {
    hasPermission = isAdmin || isTeknikko;
  } else if (requireAdmin) {
    hasPermission = isAdmin;
  } else if (requireTeknikko) {
    hasPermission = isTeknikko;
  } else {
    hasPermission = true;
  }

  if (!hasPermission) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (showTooltip) {
      const message = tooltipMessage || 
        (requireAdmin ? "Vain pääkäyttäjät voivat tehdä tämän toiminnon" : 
         requireAny ? "Vain pääkäyttäjät ja teknikot voivat tehdä tämän toiminnon" :
         "Sinulla ei ole oikeutta tähän toimintoon");

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="inline-flex items-center gap-2 opacity-50 cursor-not-allowed">
                <Shield className="h-4 w-4" />
                <span className="text-sm">Ei oikeuksia</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{message}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return null;
  }

  return <>{children}</>;
}
