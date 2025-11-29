import { Control, FieldPath, FieldValues } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";

interface AmountFormFieldProps<T extends FieldValues> {
  control: Control<T>;
  field: FieldPath<T>;
  label?: string;
  placeholder?: string;
}

const AmountFormField = <T extends FieldValues>({
  control,
  field,
  label = "Amount",
  placeholder = "0.00"
}: AmountFormFieldProps<T>) => {
  return (
    <FormField
      control={control}
      name={field}
      render={({ field }) => {
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const retrivedValue = e.target.value;
          const value = retrivedValue.replace(',', '.')
          
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