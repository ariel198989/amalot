import React from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Field {
  name: string;
  label: string;
  type: string;
  required: boolean;
  options?: { value: string; label: string; }[];
}

interface CalculatorFormProps {
  onSubmit: (data: any) => void;
  fields: Field[];
  title: string;
}

const CalculatorForm: React.FC<CalculatorFormProps> = ({ onSubmit, fields, title }) => {
  const { register, handleSubmit, setValue } = useForm();

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {fields.map((field) => (
            <div key={field.name} className="space-y-2">
              <label className="text-sm font-medium">{field.label}</label>
              {field.type === 'select' ? (
                <Select
                  onValueChange={(value) => setValue(field.name, value)}
                  {...register(field.name)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={`בחר ${field.label}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  type={field.type}
                  {...register(field.name, { required: field.required })}
                  className="w-full"
                />
              )}
            </div>
          ))}
          <Button type="submit" className="w-full">
            חשב עמלות
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CalculatorForm;