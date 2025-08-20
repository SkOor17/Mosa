"use client"

import {
    ColumnDef, ColumnFiltersState,
    flexRender,
    getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, SortingState,
    useReactTable,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/src/components/ui/table"
import {DataTablePagination} from "@/app/(protected)/[bankAccountId]/transactions/pagination";
import {ReactNode, useState} from "react";
import {Input} from "@/src/components/ui/input";
import DataTableFilter from "@/app/(protected)/[bankAccountId]/transactions/data-table-filter";
import {TransactionType} from "@/app/generated/prisma";
import {Button} from "@/src/components/ui/button";
import {removeTransactionsAction} from "@/src/lib/action/transaction-actions";
import {useRouter} from "next/navigation";
import {TransactionRow} from "@/app/(protected)/[bankAccountId]/transactions/transaction-actions";
import {columns} from "@/app/(protected)/[bankAccountId]/transactions/columns";
import {DialogContent, DialogHeader, DialogTitle, Dialog, DialogTrigger} from "@/src/components/ui/dialog";
import {UpdateTransactionForm} from "@/src/components/forms/update-transaction-form";
import {ResponsiveModal} from "@/src/components/ui/responsive-modal";

interface DataTableProps<TData, TValue> {
    data: TData[]
    categoryOptions: string[]
    categories: Array<{id: number, name: string}>
    bankAccounts: Array<{id: number, name: string, default: boolean}>
    addButton: ReactNode
}

export function DataTable<TData, TValue>({
    data,
    categoryOptions,
    categories,
    bankAccounts,
    addButton,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([
        {
            id: "date",
            desc: true
        }
    ])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [rowSelection, setRowSelection] = useState({})
    const [transaction, setTransaction] = useState<TransactionRow>()
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [dialogMode, setDialogMode] = useState<'view' | 'edit'>('view')
    const router = useRouter();

    const handleEditTransaction = (transaction: TransactionRow) => {
        setTransaction(transaction)
        setDialogMode('edit')
        setIsDialogOpen(true)
    }

    const handleViewTransaction = (transaction: TransactionRow) => {
        setTransaction(transaction)
        setDialogMode('view')
        setIsDialogOpen(true)
    }

    const tableColumns = columns({ onEdit: handleEditTransaction }) as ColumnDef<TData, TValue>[]

    const table = useReactTable({
        data,
        columns: tableColumns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            rowSelection,
        },
    })

    const typeOptions = [TransactionType.EXPENSE, TransactionType.INCOME]
    const modalTitle = dialogMode === 'edit' ? 'Edit Transaction' : 'Transaction Details'

    return (
        <div>
            <div className="flex flex-col md:flex-row py-4 gap-2">
                <Input
                    placeholder="Filter transactions..."
                    value={(table.getColumn("description")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("description")?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm"
                />
                <div className={'flex flex-wrap gap-2'}>
                    <DataTableFilter name={'Type'} options={typeOptions} table={table} column={'type'}/>
                    <DataTableFilter name={'Catégorie'} options={categoryOptions} table={table} column={'category'}/>
                    {table.getSelectedRowModel().rows.length > 0 && (
                        <Button
                            variant="default"
                            onClick={async () => {
                                const selectedIds = table.getSelectedRowModel().rows.map(row => (row.original as TransactionRow).id)
                                await removeTransactionsAction({ids: selectedIds})
                                table.resetRowSelection()
                                router.refresh()
                            }}
                        >
                            Delete {table.getSelectedRowModel().rows.length} selected
                        </Button>
                    )}
                </div>
                <div className={'hidden md:block md:flex-1'}></div>
                <div className={'w-fit hidden md:block'}>
                    {addButton}
                </div>
            </div>

            <div className="overflow-hidden rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    onClick={() => handleViewTransaction(row.original as TransactionRow)}
                                    data-state={row.getIsSelected() && "selected"}
                                    className="cursor-pointer hover:bg-muted/50"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={tableColumns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                <DataTablePagination table={table}/>
            </div>

            <ResponsiveModal
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                title={modalTitle}
            >
                {dialogMode === 'edit' ? (
                    <UpdateTransactionForm
                        transaction={transaction || {} as TransactionRow}
                        categories={categories}
                        bankAccounts={bankAccounts}
                        onClose={() => setIsDialogOpen(false)}
                    />
                ) : (
                    // TODO: Faire composant
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <p><strong>Description:</strong> {transaction?.description || 'N/A'}</p>
                            <p><strong>Amount:</strong> {transaction?.amount}</p>
                            <p><strong>Category:</strong> {transaction?.category}</p>
                            <p><strong>Date:</strong> {transaction?.date}</p>
                            <p><strong>Type:</strong> {transaction?.type}</p>
                            <p><strong>Bank Account:</strong> {transaction?.bankAccount}</p>
                        </div>
                        <Button
                            onClick={() => setDialogMode('edit')}
                            className="w-full"
                        >
                            Edit Transaction
                        </Button>
                    </div>
                )}
            </ResponsiveModal>
        </div>
    )
}