import { useNavigate } from "react-router-dom";
import { sessionManager } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield } from "lucide-react";

export const ImpersonationBanner = () => {
  const navigate = useNavigate();
  const isImpersonating = sessionManager.isImpersonating();
  const session = sessionManager.get();

  if (!isImpersonating) return null;

  const handleExit = () => {
    sessionManager.exitImpersonation();
    navigate("/dashboard/webmaster/salons");
  };

  return (
    <div className="bg-destructive text-destructive-foreground px-4 py-2 flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        <Shield className="h-4 w-4" />
        <span>
          Modo Webmaster: acessando como{" "}
          <strong>{session?.userName || "usuário"}</strong>
          {" "}(Salão ID: {session?.salonId})
        </span>
      </div>
      <Button
        variant="secondary"
        size="sm"
        onClick={handleExit}
        className="h-7 text-xs"
      >
        <ArrowLeft className="h-3 w-3 mr-1" />
        Voltar ao Webmaster
      </Button>
    </div>
  );
};
