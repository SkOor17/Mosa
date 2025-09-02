'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/src/components/ui/form';
import { useAction } from 'next-safe-action/hooks';
import { toast } from 'sonner';
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import React from "react";
import { updateCategoryAction } from "@/src/lib/action/category-action";

const formSchema = z.object({
    name: z.string().min(1, 'Category name is required').optional(),
    percentage: z.number().min(0, 'Percentage must be 0 or more').max(100, 'Percentage must be 100 or less').optional(),
});

interface UpdateCategoryFormProps {
    categoryId: number;
    initialName?: string;
    initialPercentage?: number;
    onSuccess?: () => void;
}

type SubmitPayloadType = {
    id: number
    name?: string
    percentage?: number
}

export function UpdateCategoryForm({
    categoryId,
    initialName = '',
    initialPercentage = 0,
    onSuccess
}: UpdateCategoryFormProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: initialName,
            percentage: initialPercentage,
        },
    });

    const { execute, status } = useAction(updateCategoryAction, {
        onSuccess: () => {
            toast.success('Category updated successfully');
            onSuccess?.();
        },
        onError: (error) => {
            toast.error(error.error.serverError || 'An error occurred');
        },
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        // Ne pas envoyer les valeurs vides ou inchangées
        const payload: SubmitPayloadType = { id: categoryId };

        if (values.name && values.name.trim() !== initialName) {
            payload.name = values.name;
        }

        if (values.percentage !== undefined && values.percentage !== initialPercentage) {
            payload.percentage = values.percentage;
        }

        // Si aucune modification, ne pas faire l'appel
        if (Object.keys(payload).length === 1) {
            toast.info('No changes to save');
            return;
        }

        execute(payload);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full max-w-md">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Category Name</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. Alimentation" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="percentage"
                    render={({ field }) => {
                        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                            const value = e.target.value;

                            if (value === '') {
                                field.onChange('');
                                return;
                            }

                            const isValidInput = /^\d{0,2}(\.\d{0,2})?$/.test(value) && !value.startsWith('00');
                            const numValue = parseFloat(value);

                            if (isValidInput && (isNaN(numValue) || numValue <= 100)) {
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
                                <FormLabel>Budget Percentage (%)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="text"
                                        inputMode="decimal"
                                        placeholder="15.50"
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
                <div className="flex gap-2">
                    <Button type="submit" disabled={status === 'executing'}>
                        {status === 'executing' ? 'Updating...' : 'Update Category'}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => form.reset()}
                        disabled={status === 'executing'}
                    >
                        Reset
                    </Button>
                </div>
            </form>
        </Form>
    );
}