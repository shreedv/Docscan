import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PlusIcon, Check, Upload } from "lucide-react";
import { ExtractedData, LineItem, ExpenseCategory } from "@/lib/extraction";
import LineItemRow from "@/components/LineItem";
import { CategoryBadge } from "@/components/CategoryBadge";

interface ExtractedDataFormProps {
  data: ExtractedData;
  onSaveData: (data: ExtractedData) => void;
}

const ExtractedDataForm = ({ data, onSaveData }: ExtractedDataFormProps) => {
  const [formData, setFormData] = useState<ExtractedData>(data);
  const [confidence] = useState(data.confidence || 92);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLineItemChange = (index: number, field: keyof LineItem, value: string | number) => {
    const updatedLineItems = [...formData.lineItems];
    updatedLineItems[index] = {
      ...updatedLineItems[index],
      [field]: value
    };
    
    // Update amount if quantity or unitPrice changed
    if (field === 'quantity' || field === 'unitPrice') {
      const quantity = field === 'quantity' 
        ? Number(value) 
        : Number(updatedLineItems[index].quantity);
        
      const unitPrice = field === 'unitPrice' 
        ? Number(value) 
        : Number(updatedLineItems[index].unitPrice);
        
      updatedLineItems[index].amount = (quantity * unitPrice).toFixed(2);
    }
    
    setFormData(prev => ({
      ...prev,
      lineItems: updatedLineItems
    }));
  };

  const handleAddLineItem = () => {
    setFormData(prev => ({
      ...prev,
      lineItems: [
        ...prev.lineItems,
        { description: '', quantity: 1, unitPrice: '0.00', amount: '0.00' }
      ]
    }));
  };

  const handleRemoveLineItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      lineItems: prev.lineItems.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveData(formData);
  };

  const handleCancel = () => {
    // Reset to original data
    setFormData(data);
  };

  return (
    <Card>
      <CardHeader className="px-4 py-5 sm:px-6 border-b border-gray-200 flex flex-row justify-between items-center">
        <div>
          <CardTitle className="text-lg font-medium text-gray-900">Extracted Data</CardTitle>
          <CardDescription className="text-sm text-gray-500">Review and edit the information extracted from your document</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSubmit}>
            <Check className="mr-1 h-4 w-4" />
            Save Entry
          </Button>
          <Button size="sm" variant="outline">
            <Upload className="mr-1 h-4 w-4" />
            Export
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <form id="extractedDataForm" onSubmit={handleSubmit}>
          <div className="mb-4 pb-4 border-b border-gray-200">
            <p className="text-sm text-gray-700 mb-2">Expense Category:</p>
            <div className="flex flex-wrap gap-2">
              {formData.category && (
                <CategoryBadge category={formData.category} />
              )}
              <div className="ml-2">
                <Select 
                  value={formData.category || 'Other'} 
                  onValueChange={(value) => handleSelectChange('category', value as ExpenseCategory)}
                >
                  <SelectTrigger className="h-8 text-xs px-2">
                    <SelectValue placeholder="Change category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Food & Dining">Food & Dining</SelectItem>
                    <SelectItem value="Travel">Travel</SelectItem>
                    <SelectItem value="Office Supplies">Office Supplies</SelectItem>
                    <SelectItem value="Utilities">Utilities</SelectItem>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Entertainment">Entertainment</SelectItem>
                    <SelectItem value="Medical">Medical</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <Label htmlFor="vendor">Vendor/Company</Label>
              <Input 
                id="vendor" 
                name="vendor" 
                value={formData.vendor} 
                onChange={handleInputChange} 
              />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="documentType">Document Type</Label>
              <Select 
                value={formData.documentType} 
                onValueChange={(value) => handleSelectChange('documentType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Invoice">Invoice</SelectItem>
                  <SelectItem value="Receipt">Receipt</SelectItem>
                  <SelectItem value="Purchase Order">Purchase Order</SelectItem>
                  <SelectItem value="Bill">Bill</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="date">Document Date</Label>
              <Input 
                id="date" 
                name="date" 
                type="date" 
                value={formData.date} 
                onChange={handleInputChange} 
              />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="documentNumber">Document Number</Label>
              <Input 
                id="documentNumber" 
                name="documentNumber" 
                value={formData.documentNumber} 
                onChange={handleInputChange} 
              />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="totalAmount">Total Amount</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <Input 
                  id="totalAmount" 
                  name="totalAmount" 
                  className="pl-7 pr-12"
                  value={formData.totalAmount} 
                  onChange={handleInputChange} 
                  placeholder="0.00"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">USD</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="taxAmount">Tax Amount</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <Input 
                  id="taxAmount" 
                  name="taxAmount" 
                  className="pl-7 pr-12"
                  value={formData.taxAmount} 
                  onChange={handleInputChange} 
                  placeholder="0.00"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">USD</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <h4 className="text-sm font-medium text-gray-700 mb-4">Line Items</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th scope="col" className="relative px-4 py-3 w-10">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {formData.lineItems.map((item, index) => (
                    <LineItemRow 
                      key={index}
                      item={item}
                      onChange={(field, value) => handleLineItemChange(index, field, value)}
                      onRemove={() => handleRemoveLineItem(index)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-2">
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={handleAddLineItem}
              >
                <PlusIcon className="mr-1 h-4 w-4" />
                Add Line Item
              </Button>
            </div>
          </div>
          
          <div className="mt-8">
            <Label htmlFor="notes">Notes</Label>
            <Textarea 
              id="notes" 
              name="notes" 
              rows={3} 
              value={formData.notes} 
              onChange={handleInputChange}
            />
          </div>
          
          <div className="mt-8 flex justify-between border-t border-gray-200 pt-4">
            <span className="text-xs text-gray-500">
              Confidence score: <span className="font-medium text-primary">{confidence}%</span>
            </span>
            <div className="flex space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button type="submit">
                Save Data
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ExtractedDataForm;
