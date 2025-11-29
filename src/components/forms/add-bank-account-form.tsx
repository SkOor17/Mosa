'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/src/components/ui/form';
import { useAction } from 'next-safe-action/hooks';
import { toast } from 'sonner';
import {addBankAccountAction} from "@/src/lib/action/bank-account-actions";
import {Input} from "@/src/components/ui/input";
import {Button} from "@/src/components/ui/button";
import React from "react";
import AmountFormField from '../form-fields/amount-form-field';

const formSchema = z.object({
    name: z.string().min(1, 'Account name is required'),
    initialAmount: z.number().nonnegative('Amount must be 0 or more'),
});

export function AddBankAccountForm() {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            initialAmount: 0,
        },
    });

    const { execute, status } = useAction(addBankAccountAction, {
        onSuccess: () => {
            toast.success('Account created successfully');
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
                            <FormLabel>Account Name</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. Livret A" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <AmountFormField control={form.control} field='initialAmount'/>
                <Button type="submit" disabled={status === 'executing'}>
                    {status === 'executing' ? 'Creating...' : 'Create Account'}
                </Button>
            </form>
        </Form>
    );
}
