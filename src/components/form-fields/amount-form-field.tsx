import { FieldPath, UseFormReturn } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
// Interface générique qui nécessite seulement un champ amount
interface BaseFormData {
  amount: number;
}

interface AmountFormFieldProps<T extends BaseFormData> {
  form: UseFormReturn<T>;
  name?: FieldPath<T>; // Permet de spécifier un nom de champ différent si nécessaire
  label?: string;
  placeholder?: string;
}

const AmountFormField = <T extends BaseFormData>({
  form,
  name = "amount" as FieldPath<T>,
  label = "Amount",
  placeholder = "0.00"
}: AmountFormFieldProps<T>) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => {
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const value = e.target.value;
          if (value === '') {
            field.onChange('');
            return;
          }
          
          const isValidInput = /^\d*\.?\d{0,2}$/.test(value) && !value.startsWith('00');
          if (isValidInput) {
            if (value && !value.endsWith('.') && value !== '0.') {
              const num = parseFloat(value);
              if (!isNaN(num)) {
                field.onChange(num);
                return;
              }
            }
            field.onChange(value);
          }
        };

        return (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <Input
                type="text"
                inputMode="decimal"
                placeholder={placeholder}
                {...field}
                value={field.value ?? ''}
                onChange={handleChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};

export default AmountFormField;