"use client"

import {ColumnDef} from "@tanstack/table-core";
import {TransactionType} from "@/app/generated/prisma";
import {Badge} from "@/src/components/ui/badge";
import {DataTableColumnHeader} from "@/app/(protected)/[bankAccountId]/transactions/data-table-column-header";
import {Checkbox} from "@/src/components/ui/checkbox";
import {cn} from "@/src/lib/utils";
import {TransactionActions, TransactionRow} from "@/app/(protected)/[bankAccountId]/transactions/transaction-actions";

type ColumnsProps = {
    onEdit: (transaction: TransactionRow) => void // Nouveau prop
}

export const columns = ({ onEdit }: ColumnsProps): ColumnDef<TransactionRow>[] => [
    {
        id: "select",
        header: ({ table }) => (
            <div
                onClick={(e) => e.stopPropagation()}
                className={"cursor-pointer flex w-full justify-center items-center"}
            >
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            </div>
        ),
        cell: ({ row }) => (
            <div
                onClick={(e) => e.stopPropagation()}
                className={"cursor-pointer flex w-full justify-center items-center"}
            >
                <Checkbox
                    onClick={(e) => e.stopPropagation()}
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                    className={"cursor-pointer"}
                />
            </div>
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "type",
        filterFn: 'arrIncludesSome',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Type" />
        ),
        cell: ({ row }) => {
            const type = row.original.type
            return (
                <Badge className={cn(type === TransactionType.INCOME ? 'bg-green-100 text-green-400' : 'bg-red-100 text-red-400', 'font-semibold')}>
                    {type === TransactionType.INCOME ? 'Entrée' : 'Sortie'}
                </Badge>
            )
        },
    },
    {
        accessorKey: "description",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Description" />
        ),
    },
    {
        accessorKey: "amount",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Montant" />
        ),
    },
    {
        accessorKey: "category",
        filterFn: 'arrIncludesSome',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Category" />
        ),
        cell: ({ row }) => {
            const category = row.original.category
            return (
                <Badge variant={'secondary'}>
                    {category}
                </Badge>
            )
        },
    },
    {
        accessorKey: "date",
        sortingFn: (rowA, rowB, columnId) => {
            const dateA = rowA.getValue(columnId) as string;
            const dateB = rowB.getValue(columnId) as string;
            
            // Conversion du format dd/mm/yyyy vers Date
            const parseDate = (dateStr: string): Date => {
                if (!dateStr) return new Date(0);
                const [day, month, year] = dateStr.split('/');
                return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            };
            
            const parsedA = parseDate(dateA);
            const parsedB = parseDate(dateB);
            
            return parsedA.getTime() - parsedB.getTime();
        },
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Date" />
        ),
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const transaction = row.original
            return (
                <TransactionActions
                    transaction={transaction}
                    onEdit={onEdit} // Passer la fonction onEdit
                />
            )
        },
    },
]