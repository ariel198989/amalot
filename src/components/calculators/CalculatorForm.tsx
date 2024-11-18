import React from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, CreditCard, Building2, Percent } from 'lucide-react';

interface Field {
  name: string;
  label: string;
  type: string;
  required: boolean;
  icon?: React.ElementType;
  options?: { value: string; label: string; }[];
}

interface CalculatorFormProps {
  onSubmit: (data: any) => void;
  fields: Field[];
  title: string;
  description?: string;
}

const CalculatorForm: React.FC<CalculatorFormProps> = ({ 
  onSubmit, 
  fields, 
  title,
  description = "הזן את הפרטים הנדרשים לחישוב העמלות" 
}) => {
  const { register, handleSubmit, setValue } = useForm();

  const getFieldIcon = (type: string) => {
    switch (type) {
      case 'number':
        return CreditCard;
      case 'select':
        return Building2;
      case 'percent':
        return Percent;
      default:
        return Calculator;
    }
  };

  return (
    <Card className="border-2 border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300" dir="rtl">
      <CardHeader className="bg-gradient-to-l from-blue-50 to-blue-100 border-b border-blue-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg shadow-sm">
            <Calculator className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-blue-900">{title}</CardTitle>
            <CardDescription className="text-blue-600">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fields.map((field) => {
              const Icon = field.icon || getFieldIcon(field.type);
              return (
                <div 
                  key={field.name} 
                  className="group relative bg-white p-4 rounded-lg border-2 border-gray-100 hover:border-blue-200 transition-all duration-200"
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field.label}
                    {field.required && <span className="text-red-500 mr-1">*</span>}
                  </label>
                  <div className="relative">
                    {field.type === 'select' ? (
                      <Select
                        onValueChange={(value) => setValue(field.name, value)}
                        {...register(field.name)}
                      >
                        <SelectTrigger className="w-full pr-10 border-gray-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 text-right">
                          <SelectValue placeholder={`בחר ${field.label}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options?.map((option) => (
                            <SelectItem 
                              key={option.value} 
                              value={option.value}
                              className="hover:bg-blue-50 text-right"
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        type={field.type}
                        {...register(field.name, { required: field.required })}
                        className="w-full pr-10 border-gray-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 text-right"
                        placeholder={`הזן ${field.label}`}
                      />
                    )}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-blue-500 transition-colors">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <Button 
            type="submit" 
            className="w-full h-12 text-lg bg-gradient-to-l from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 group"
          >
            <Calculator className="h-5 w-5 ml-2 group-hover:scale-110 transition-transform" />
            חשב עמלות
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CalculatorForm;