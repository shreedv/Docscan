import { LineItem } from "@/lib/extraction";
import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";

interface LineItemRowProps {
  item: LineItem;
  onChange: (field: keyof LineItem, value: string | number) => void;
  onRemove: () => void;
}

const LineItemRow = ({ item, onChange, onRemove }: LineItemRowProps) => {
  return (
    <tr>
      <td className="px-4 py-2">
        <Input
          className="border-0"
          value={item.description}
          onChange={(e) => onChange('description', e.target.value)}
        />
      </td>
      <td className="px-4 py-2">
        <Input
          className="border-0"
          type="number"
          min="0"
          value={item.quantity}
          onChange={(e) => onChange('quantity', e.target.value)}
        />
      </td>
      <td className="px-4 py-2">
        <Input
          className="border-0"
          value={item.unitPrice}
          onChange={(e) => onChange('unitPrice', e.target.value)}
        />
      </td>
      <td className="px-4 py-2">
        <Input
          className="border-0"
          value={item.amount}
          onChange={(e) => onChange('amount', e.target.value)}
        />
      </td>
      <td className="px-4 py-2 text-right">
        <button 
          type="button" 
          className="text-gray-400 hover:text-gray-500"
          onClick={onRemove}
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </td>
    </tr>
  );
};

export default LineItemRow;
