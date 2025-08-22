"use client"

import { useState, useTransition } from "react"
import { Check, ChevronsUpDown, Plus } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/src/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/src/components/ui/popover"
import { addCategoryAction } from "@/src/lib/action/category-action"
import { toast } from "sonner"
import {cn} from "@/src/lib/utils";

interface Category {
    id: number
    name: string
}

interface CategorySelectProps {
    categories: Category[]
    value: string
    onValueChange: (value: string) => void
    onCategoriesUpdate?: (newCategories: Category[]) => void
    placeholder?: string
    className?: string
}

export function CategorySelect({
    categories,
    value,
    onValueChange,
    onCategoriesUpdate,
    placeholder = "Catégorie",
    className,
}: CategorySelectProps) {
    const [open, setOpen] = useState(false)
    const [searchValue, setSearchValue] = useState("")
    const [isPending, startTransition] = useTransition()
    const [localCategories, setLocalCategories] = useState(categories)

    const filteredCategories = localCategories.filter((category) =>
        category.name.toLowerCase().includes(searchValue.toLowerCase())
    )

    const showAddOption = searchValue.trim() !== "" &&
        !filteredCategories.some(cat =>
            cat.name.toLowerCase() === searchValue.toLowerCase()
        )

    const handleSelectCategory = (categoryName: string) => {
        onValueChange(categoryName === value ? "" : categoryName)
        setOpen(false)
        setSearchValue("")
    }

    const handleAddCategory = () => {
        if (!searchValue.trim() || isPending) return

        startTransition(async () => {
            try {
                const result = await addCategoryAction({
                    name: searchValue.trim(),
                    percentage: 0,
                })

                const newCategory = {
                    id: result.data?.id || -1,
                    name: result.data?.name || '',
                }

                const updatedCategories = [...localCategories, newCategory]
                setLocalCategories(updatedCategories)

                onCategoriesUpdate?.(updatedCategories)

                onValueChange(newCategory.name)

                setOpen(false)
                setSearchValue("")

                toast.success(`Catégorie "${result.data?.name}" créée avec succès`)
            } catch (error) {
                toast.error(error instanceof Error ? error.message : "Erreur lors de la création de la catégorie")
            }
        })
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between", className)}
                    disabled={isPending}
                >
                    {value
                        ? localCategories.find((category) => category.name === value)?.name
                        : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="pointer-events-auto">
                <Command>
                    <CommandInput
                        placeholder="Rechercher une catégorie..."
                        value={searchValue}
                        onValueChange={setSearchValue}
                    />
                    <CommandList>
                        <CommandEmpty>
                            {searchValue.trim() ? (
                                <div className="text-sm text-muted-foreground p-2">
                                    {`Aucune catégorie trouvée pour "${searchValue}"`}
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground p-2">
                                    Aucune catégorie disponible
                                </div>
                            )}
                        </CommandEmpty>

                        {filteredCategories.length > 0 && (
                            <CommandGroup heading="Catégories existantes">
                                {filteredCategories.map((category) => (
                                    <CommandItem
                                        key={category.id}
                                        value={category.name}
                                        onSelect={() => handleSelectCategory(category.name)}
                                        onClick={() => handleSelectCategory(category.name)}
                                        className="cursor-pointer"
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                value === category.name ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        {category.name}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}

                        {showAddOption && (
                            <CommandGroup heading="Nouvelle catégorie">
                                <CommandItem
                                    onSelect={handleAddCategory}
                                    onClick={handleAddCategory}
                                    disabled={isPending}
                                    className="cursor-pointer"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    {`Ajouter "${searchValue}"`}
                                    {isPending && (
                                        <div className="ml-auto">
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                        </div>
                                    )}
                                </CommandItem>
                            </CommandGroup>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}