import * as React from "react";
import { Input } from "./input";
import { cn } from "@/lib/utils";

export interface MaskedInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  mask: (value: string) => string;
  onChange?: (value: string) => void;
}

const MaskedInput = React.forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ className, mask, onChange, value, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState(
      mask(String(value || ''))
    );

    React.useEffect(() => {
      setDisplayValue(mask(String(value || '')));
    }, [value, mask]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const maskedValue = mask(e.target.value);
      setDisplayValue(maskedValue);
      onChange?.(maskedValue);
    };

    return (
      <Input
        type="text"
        className={cn(className)}
        ref={ref}
        value={displayValue}
        onChange={handleChange}
        {...props}
      />
    );
  }
);

MaskedInput.displayName = "MaskedInput";

export { MaskedInput };
