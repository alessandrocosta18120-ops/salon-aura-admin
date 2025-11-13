import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PageHeaderProps {
  title: string;
  description?: string;
  showBack?: boolean;
  showHome?: boolean;
}

export const PageHeader = ({ 
  title, 
  description, 
  showBack = true, 
  showHome = true 
}: PageHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="flex items-center gap-2">
        {showBack && (
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2"
            title="Voltar"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        {showHome && (
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate("/dashboard")} 
            className="flex items-center gap-2"
            title="Página Inicial"
          >
            <Home className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
};
