'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/src/components/ui/form';
import { useAction } from 'next-safe-action/hooks';
import { toast } from 'sonner';
import {updateTransactionAction} from "@/src/lib/action/transaction-actions";
import {TransactionType} from "@/app/generated/prisma";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/src/components/ui/select";
import {Input} from "@/src/components/ui/input";
import {Button} from "@/src/components/ui/button";
import {parseFrenchDate} from "@/src/lib/utils/date";
import {Popover, PopoverContent, PopoverTrigger} from "@/src/components/ui/popover";
import {format} from "date-fns";
import {fr} from "date-fns/locale";
import {CalendarIcon} from "lucide-react";
import {Calendar} from "@/src/components/ui/calendar";
import {TransactionRow} from "@/app/(protected)/[bankAccountId]/transactions/transaction-actions";
import React, {useState} from "react";
import {CategorySelect} from "@/src/components/ui/category-select";

const formSchema = z.object({
    id: z.number(),
    amount: z.number().min(0, 'Amount must be positive'),
    type: z.enum([TransactionType.INCOME, TransactionType.EXPENSE]),
    description: z.string().min(1, 'Description is required'),
    date: z.date(),
    categoryName: z.string().min(1, 'Category is required'),
    bankAccount: z.string().min(1, 'Bank account is required'),
});

interface UpdateTransactionFormProps {
    transaction: TransactionRow;
    onClose?: () => void;
    categories: Array<{id: number, name: string}>
    bankAccounts: Array<{id: number, name: string}>
}

export function UpdateTransactionForm({ transaction, onClose, categories, bankAccounts }: UpdateTransactionFormProps) {
    const [categoriesState, setCategoriesState] = useState(categories)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            id: transaction.id,
            amount: parseFloat(transaction.amount),
            description: transaction?.description || '',
            date: parseFrenchDate(transaction.date),
            type: transaction.type,
            categoryName: transaction.category || '',
            bankAccount: transaction.bankAccount || '',
        },
    });

    const { execute, status } = useAction(updateTransactionAction, {
        onSuccess: () => {
            toast.success('Transaction updated successfully');
            form.reset();
            onClose?.();
        },
        onError: (error) => {
            console.error('❌ Action ERROR:', error);
            toast.error('An error occurred while updating the transaction');
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
                                <FormLabel>
                                    Category
                                </FormLabel>
                                <FormControl>
                                    <CategorySelect
                                        categories={categoriesState}
                                        value={field.value || ""}
                                        onValueChange={field.onChange}
                                        onCategoriesUpdate={setCategoriesState}
                                        className="w-full"
                                    />
                                </FormControl>
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
                <div className="flex gap-2 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            onClose?.();
                        }}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={status === 'executing'}
                        className="flex-1"
                    >
                        {status === 'executing' ? 'Updating...' : 'Update Transaction'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}