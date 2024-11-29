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

  const getFieldIcon = (type: string) => {
    switch (type) {
      case 'number':
        return Calculator;
      case 'select':
        return Calculator;
      case 'percent':
        return Calculator;
      default:
        return Calculator;
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader className="space-y-2 bg-gray-50/80 text-right">
        <CardTitle className="text-xl font-semibold text-gray-900">{title}</CardTitle>
        {description && (
          <CardDescription className="text-gray-600">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" dir="rtl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fields.map((field) => (
              <div key={field.name} className="space-y-2">
                <div className="text-sm font-medium text-gray-700 text-right">
                  {field.label}
                  {field.required && <span className="text-red-500 mr-1">*</span>}
                </div>
                
                {field.type === 'select' ? (
                  <Select
                    onValueChange={(value) => setValue(field.name, value)}
                    defaultValue={field.defaultValue}
                  >
                    <SelectTrigger className="w-full text-right">
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
                    className="w-full text-right"
                    dir="rtl"
                    {...register(field.name, { required: field.required })}
                  />
                )}
              </div>
            ))}
          </div>
          
          <div className="flex justify-start">
            <Button 
              type="submit" 
              className="bg-primary hover:bg-primary/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  מחשב...
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                </>
              ) : (
                <>
                  חשב עמלה
                  <Calculator className="ml-2 h-4 w-4" />
                </>
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