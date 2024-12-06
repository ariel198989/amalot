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
              <Controller
                name={field.name}
                control={control}
                rules={{ required: field.required }}
                defaultValue=""
                render={({ field: { onChange, value } }) => (
                  <Select onValueChange={onChange} value={value || ""}>
                    <SelectTrigger className={cn("w-full text-right h-10 px-3 py-2", field.className)}>
                      <SelectValue placeholder={`בחר ${field.label}`} />
                    </SelectTrigger>
                    <SelectContent className={cn("text-right", field.popoverClassName)}>
                      {field.options?.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            ) : (
              <Controller
                name={field.name}
                control={control}
                rules={{ required: field.required }}
                render={({ field: { onChange, value } }) => (
                  <Input
                    type={field.type}
                    onChange={onChange}
                    value={value || ""}
                    className={cn("text-right", field.className)}
                  />
                )}
              />
            )}
          </div>
        ))}
      </div>
      <Button type="submit" className="w-full">חשב</Button>
    </form>
  );
};

export default CalculatorForm;