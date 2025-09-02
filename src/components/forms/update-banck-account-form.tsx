'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/src/components/ui/form';
import { useAction } from 'next-safe-action/hooks';
import { toast } from 'sonner';
import { updateBankAccountAction } from "@/src/lib/action/bank-account-actions";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import React from "react";

const formSchema = z.object({
    name: z.string().min(1, 'Account name is required'),
});

interface UpdateBankAccountFormProps {
    accountId: number;
    initialName?: string;
    onSuccess?: () => void;
}

export function UpdateBankAccountForm({
                                          accountId,
                                          initialName = '',
                                          onSuccess
                                      }: UpdateBankAccountFormProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: initialName,
        },
    });

    const { execute, status } = useAction(updateBankAccountAction, {
        onSuccess: () => {
            toast.success('Account updated successfully');
            onSuccess?.();
        },
        onError: (error) => {
            toast.error(error.error.serverError || 'An error occurred');
        },
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        // Vérifier s'il y a eu un changement
        if (values.name.trim() === initialName.trim()) {
            toast.info('No changes to save');
            return;
        }

        execute({ id: accountId, name: values.name });
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
                <div className="flex gap-2">
                    <Button type="submit" disabled={status === 'executing'}>
                        {status === 'executing' ? 'Updating...' : 'Update Account'}
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