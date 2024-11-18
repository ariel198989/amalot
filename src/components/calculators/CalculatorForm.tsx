import React from 'react';
import { useForm } from 'react-hook-form';

interface CalculatorFormProps {
  onSubmit: (data: any) => void;
  fields: {
    name: string;
    label: string;
    type: string;
    options?: { value: string; label: string }[];
    required?: boolean;
  }[];
  title: string;
}

const CalculatorForm: React.FC<CalculatorFormProps> = ({ onSubmit, fields, title }) => {
  const { register, handleSubmit, reset } = useForm();

  const onFormSubmit = (data: any) => {
    onSubmit(data);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="bg-white p-6 rounded-lg shadow mb-6">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-medium mb-1">{field.label}</label>
            {field.type === 'select' ? (
              <select
                {...register(field.name)}
                className="select-field"
                required={field.required}
              >
                {field.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={field.type}
                {...register(field.name)}
                className="input-field"
                required={field.required}
              />
            )}
          </div>
        ))}
      </div>
      <div className="mt-4">
        <button type="submit" className="btn btn-primary">
          חשב עמלות
        </button>
      </div>
    </form>
  );
};

export default CalculatorForm;