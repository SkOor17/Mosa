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
import {addCategoryAction} from "@/src/lib/action/category-action";

const formSchema = z.object({
    name: z.string().min(1, 'Category name is required'),
    percentage: z.number().min(0, 'Percentage must be 0 or more').max(100, 'Percentage must be 100 or less'),
});

export function AddCategoryForm() {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            percentage: 0,
        },
    });

    const { execute, status } = useAction(addCategoryAction, {
        onSuccess: () => {
            toast.success('Category created successfully');
            form.reset();
        },
        onError: () => {
            toast.error('An error occurred');
        },
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        execute(values);
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
                <Button type="submit" disabled={status === 'executing'}>
                    {status === 'executing' ? 'Creating...' : 'Create Category'}
                </Button>
            </form>
        </Form>
    );
}