import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Field {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  className?: string;
  containerClassName?: string;
  popoverClassName?: string;
}

interface CalculatorFormProps {
  onSubmit: (data: any) => void;
  fields: Field[];
  title?: string;
}

const CalculatorForm: React.FC<CalculatorFormProps> = ({ onSubmit, fields, title }) => {
  const { control, handleSubmit } = useForm();

  const handleFormSubmit = (data: any) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {title && <h3 className="text-lg font-medium mb-4">{title}</h3>}
      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.name} className={cn("space-y-2", field.containerClassName)}>
            <label className="text-sm font-medium flex items-center">
              {field.label}
              {field.required && <span className="text-red-500 mr-1">*</span>}
            </label>
            {field.type === 'select' ? (
<<<<<<< HEAD
              <Controller
                name={field.name}
                control={control}
                rules={{ required: field.required }}
                render={({ field: { onChange, value } }) => (
                  <Select onValueChange={onChange} value={value}>
                    <SelectTrigger className={cn("w-full text-right h-10 px-3 py-2", field.className)}>
                      <SelectValue placeholder={`בחר ${field.label}`} />
                    </SelectTrigger>
                    <SelectContent className={cn("bg-white", field.popoverClassName)}>
                      {field.options?.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="text-right">
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
=======
              <Select
                onValueChange={(value) => setValue(field.name, value)}
                defaultValue=""
              >
                <SelectTrigger className={cn("w-full text-right h-10 px-3 py-2", field.className)}>
                  <SelectValue placeholder={`בחר ${field.label}`} />
                </SelectTrigger>
                <SelectContent className={cn("bg-white", field.popoverClassName)}>
                  {field.options?.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-right">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
>>>>>>> ccc4860a90dcfca3c6cd1b30a04ed802e605921f
            ) : (
              <Controller
                name={field.name}
                control={control}
                rules={{ required: field.required }}
                render={({ field: { onChange, value } }) => (
                  <Input
                    type={field.type}
                    placeholder={`הכנס ${field.label}`}
                    dir="rtl"
                    value={value || ''}
                    onChange={onChange}
                    className={cn("bg-white", field.className)}
                  />
                )}
              />
            )}
          </div>
        ))}
      </div>
      <Button type="submit" className="w-full bg-primary">
        חשב עמלה
      </Button>
    </form>
  );
};

export default CalculatorForm;