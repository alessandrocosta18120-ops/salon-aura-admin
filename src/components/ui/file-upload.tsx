import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Image } from "lucide-react";

interface FileUploadProps {
  id?: string;
  label?: string;
  accept?: string;
  value?: string;
  onChange?: (file: File | null, preview?: string) => void;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
}

export const FileUpload = React.forwardRef<HTMLInputElement, FileUploadProps>(
  ({ 
    id, 
    label, 
    accept = "image/*", 
    value, 
    onChange, 
    className, 
    disabled, 
    placeholder = "Selecione um arquivo..." 
  }, ref) => {
    const [preview, setPreview] = React.useState<string | null>(value || null);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const previewUrl = e.target?.result as string;
          setPreview(previewUrl);
          onChange?.(file, previewUrl);
        };
        reader.readAsDataURL(file);
      }
    };

    const handleRemove = () => {
      setPreview(null);
      onChange?.(null);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    };

    const handleClick = () => {
      inputRef.current?.click();
    };

    React.useImperativeHandle(ref, () => inputRef.current!);

    return (
      <div className={cn("space-y-2", className)}>
        {label && (
          <Label htmlFor={id} className="text-sm font-medium">
            {label}
          </Label>
        )}
        
        <div className="space-y-3">
          <Input
            ref={inputRef}
            id={id}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            disabled={disabled}
            className="hidden"
          />
          
          <Button
            type="button"
            variant="outline"
            onClick={handleClick}
            disabled={disabled}
            className="w-full h-auto p-4 flex flex-col items-center gap-2 border-dashed"
          >
            <Upload className="h-6 w-6 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{placeholder}</span>
          </Button>

          {preview && (
            <div className="relative border rounded-lg p-3 bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  {preview.startsWith('data:image') ? (
                    <img 
                      src={preview} 
                      alt="Preview" 
                      className="h-16 w-16 object-cover rounded border"
                    />
                  ) : (
                    <div className="h-16 w-16 bg-muted rounded border flex items-center justify-center">
                      <Image className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {preview.startsWith('data:') ? 'Arquivo selecionado' : preview}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Clique no botão acima para alterar
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemove}
                  disabled={disabled}
                  className="flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

FileUpload.displayName = "FileUpload";