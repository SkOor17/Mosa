'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/src/components/ui/form';
import { useAction } from 'next-safe-action/hooks';
import { toast } from 'sonner';
import {addTransactionAction} from "@/src/lib/action/transaction-actions";
import {TransactionType} from "@/app/generated/prisma";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/src/components/ui/select";
import {Input} from "@/src/components/ui/input";
import {Button} from "@/src/components/ui/button";
import { Calendar } from "@/src/components/ui/calendar";
import {CalendarIcon} from "lucide-react";
import {Popover, PopoverContent, PopoverTrigger} from "@/src/components/ui/popover";
import {format} from "date-fns";
import {fr} from "date-fns/locale";
import React from "react";

const formSchema = z.object({
    amount: z.number('Must be a number').min(0, 'An amount is required'),
    type: z.enum([TransactionType.INCOME, TransactionType.EXPENSE], 'Type is required'),
    description: z.string(),
    date: z.date(),
    categoryName: z.string('Please select a category').min(1, 'Category is required'),
    bankAccount: z.string('Please select a bank account').min(1,'The bank account linked is required'),
});

interface AddTransactionFormProps {
    categories: {
        id: number;
        name: string;
        default?: boolean;
    }[];
    bankAccounts: {
        id: number;
        name: string;
        default?: boolean;
    }[];
}

export function AddTransactionForm({ categories, bankAccounts }: AddTransactionFormProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            amount: 0,
            description: '',
            date: new Date(),
            type: TransactionType.EXPENSE,
            categoryName: categories.find((c) => c.default)?.name || '',
            bankAccount: bankAccounts.find((ba) => ba.default)?.name || '',
        },
    });

    const { execute, status } = useAction(addTransactionAction, {
        onSuccess: () => {
            toast.success('Transaction added successfully');
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
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. Courses super U" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className={"flex gap-4 w-full items-start"}>
                    <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                            <FormItem className={"flex-1"}>
                                <FormLabel>Type</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger className={"w-full"}>
                                            <SelectValue placeholder="Select transaction type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value={TransactionType.INCOME}>Entrée</SelectItem>
                                        <SelectItem value={TransactionType.EXPENSE}>Dépense</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="categoryName"
                        render={({ field }) => (
                            <FormItem className={"flex-1"}>
                                <FormLabel>Category</FormLabel>
                                <Select onValueChange={field.onChange} value={field?.value || ""}>
                                    <FormControl>
                                        <SelectTrigger className={"w-full"}>
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {categories.map((categorie) => (
                                            <SelectItem key={categorie.id} value={categorie.name}>
                                                {categorie.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <FormField
                    control={form.control}
                    name="bankAccount"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Bank Account</FormLabel>
                            <Select onValueChange={field.onChange} value={field?.value || ""}>
                                <FormControl>
                                    <SelectTrigger className={"w-full"}>
                                        <SelectValue placeholder="Select a bank account" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {bankAccounts.map((bankAccount) => (
                                        <SelectItem key={bankAccount.id} value={bankAccount.name}>
                                            {bankAccount.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="amount"
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
                                <FormLabel>Amount</FormLabel>
                                <FormControl>
                                    <Input
                                        type="text"
                                        inputMode="decimal"
                                        placeholder="0.00"
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
                <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Date</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant="outline"
                                            className="w-full pl-3 text-left font-normal"
                                        >
                                            {field.value ? (
                                                format(field.value, "PPP", { locale: fr })
                                            ) : (
                                                <span>Pick a date</span>
                                            )}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={(date) =>
                                            date > new Date() || date < new Date("1900-01-01")
                                        }
                                        locale={fr}
                                    />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={status === 'executing'}>
                    {status === 'executing' ? 'Adding...' : 'Add Transaction'}
                </Button>
            </form>
        </Form>
    );
}
