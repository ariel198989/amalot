import React from 'react';
import { useForm } from 'react-hook-form';
import { Card } from "@/components/ui/card";
import { CardContent } from "@/components/ui/card";
import { CardHeader } from "@/components/ui/card";
import { CardTitle } from "@/components/ui/card";
import { CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, Loader2 } from 'lucide-react';

interface Field {
  name: string;
  label: string;
  type: string;
  required: boolean;
  icon?: React.ElementType;
  options?: { value: string; label: string; }[];
  defaultValue?: string;
  width?: 'full' | 'half' | 'third';
}

interface CalculatorFormProps {
  onSubmit: (data: any) => void;
  fields: Field[];
  title: string;
  description?: string;
}

const CalculatorForm = React.forwardRef<HTMLFormElement, CalculatorFormProps>(({ 
  onSubmit, 
  fields, 
  title,
  description = "הזן את הפרטים הנדרשים לחישוב העמלות" 
}, ref) => {
  const { register, handleSubmit, setValue, isSubmitting } = useForm();

  const getFieldWidth = (field: Field) => {
    switch (field.width) {
      case 'full':
        return 'col-span-1 md:col-span-2 lg:col-span-3';
      case 'half':
        return 'col-span-1 md:col-span-1 lg:col-span-2';
      case 'third':
      default:
        return 'col-span-1';
    }
  };

  return (
    <Card className="mb-6 max-w-7xl mx-auto">
      <CardHeader className="space-y-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-right px-6 py-4">
        <CardTitle className="text-2xl font-bold text-gray-900">{title}</CardTitle>
        {description && (
          <CardDescription className="text-gray-600 text-base">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" dir="rtl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
            {fields.map((field) => (
              <div key={field.name} className={`${getFieldWidth(field)} space-y-2`}>
                <div className="flex items-center justify-between">
                  <label htmlFor={field.name} className="text-sm font-medium text-gray-700">
                    {field.label}
                    {field.required && <span className="text-red-500 mr-1">*</span>}
                  </label>
                </div>
                
                {field.type === 'select' ? (
                  <Select
                    onValueChange={(value) => setValue(field.name, value)}
                    defaultValue={field.defaultValue}
                  >
                    <SelectTrigger className="w-full text-right h-10 px-3 py-2 bg-white">
                      <SelectValue placeholder={`בחר ${field.label}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="text-right">
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id={field.name}
                    type={field.type}
                    placeholder={`הכנס ${field.label}`}
                    className="w-full text-right h-10 px-3 py-2 bg-white"
                    dir="rtl"
                    {...register(field.name, { required: field.required })}
                  />
                )}
              </div>
            ))}
          </div>
          
          <div className="flex justify-start pt-4">
            <Button 
              type="submit" 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>מחשב...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  <span>חשב עמלה</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
});

CalculatorForm.displayName = "CalculatorForm";

export default CalculatorForm;