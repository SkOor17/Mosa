"use client"

import {Button} from "@/src/components/ui/button";
import {CirclePlusIcon} from "lucide-react";
import {DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuSeparator} from "@/src/components/ui/dropdown-menu";
import React, {useState} from "react";
import {Table} from "@tanstack/react-table";
import {Separator} from "@/src/components/ui/separator"
import {Badge} from "@/src/components/ui/badge"

interface DataTableFilterProps<TData> {
    table: Table<TData>
    name: string
    options: string[]
    column: string
}

export function DataTableFilter<TData>({
   table,
   name,
   options,
   column,
}: DataTableFilterProps<TData>) {
    const [optionsSelected, setOptionsSelected] = useState<string[]>([])

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    className={"border-dashed w-fit"}
                    variant={'outline'}
                >
                    <CirclePlusIcon />
                    <p>{name}</p>
                    {optionsSelected.length > 0 && <Separator orientation={'vertical'}/>}
                    {optionsSelected.map((option) => (
                        <Badge
                            key={option}
                            variant={'secondary'}
                        >
                            {option}
                        </Badge>
                    ))}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={'start'}>
                {options.map(option => (
                    <DropdownMenuCheckboxItem
                        key={option}
                        className={'cursor-pointer'}
                        checked={optionsSelected.includes(option)}
                        onCheckedChange={(checked) => {
                            const newOptions = checked ? [...optionsSelected, option] : optionsSelected.filter((item) => item !== option)
                            setOptionsSelected(newOptions)
                            table.getColumn(column)?.setFilterValue(newOptions)
                        }}
                    >
                        {option}
                    </DropdownMenuCheckboxItem>
                ))}
                {optionsSelected.length > 0 && (
                    <>
                        <DropdownMenuSeparator/>
                        <DropdownMenuCheckboxItem
                            onClick={() => {
                                setOptionsSelected([])
                                table.getColumn(column)?.setFilterValue([])
                            }}
                            className={'cursor-pointer text-center'}
                        >
                            Reset
                        </DropdownMenuCheckboxItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default DataTableFilter;