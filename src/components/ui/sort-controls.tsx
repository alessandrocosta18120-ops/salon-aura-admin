import { Button } from "@/components/ui/button";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

export type SortDirection = 'asc' | 'desc';
export type SortField = 'name' | 'date' | 'phone';

interface SortControlsProps {
  sortField: SortField;
  sortDirection: SortDirection;
  onSortChange: (field: SortField) => void;
  showDateSort?: boolean;
}

export const SortControls = ({
  sortField,
  sortDirection,
  onSortChange,
  showDateSort = true,
}: SortControlsProps) => {
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />;
    return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-muted-foreground">Ordenar por:</span>
      <Button
        variant={sortField === 'name' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onSortChange('name')}
        className="gap-1"
      >
        Nome
        {getSortIcon('name')}
      </Button>
      {showDateSort && (
        <Button
          variant={sortField === 'date' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onSortChange('date')}
          className="gap-1"
        >
          Data
          {getSortIcon('date')}
        </Button>
      )}
      <Button
        variant={sortField === 'phone' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onSortChange('phone')}
        className="gap-1"
      >
        Telefone
        {getSortIcon('phone')}
      </Button>
    </div>
  );
};
