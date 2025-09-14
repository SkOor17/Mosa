"use client"

import { UpdateCategoryForm } from "@/src/components/forms/update-category-form"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/src/components/ui/dropdown-menu"
import { Progress } from "@/src/components/ui/progress"
import { ResponsiveModal } from "@/src/components/ui/responsive-modal"
import { deleteCategoryAction } from "@/src/lib/action/category-action"
import { cn } from "@/src/lib/utils"
import { SerializableCategoryWithBudget } from "@/src/lib/utils/serialize"
import { AlertTriangleIcon, Edit2Icon, EllipsisVerticalIcon, Trash2Icon } from "lucide-react"

interface BudgetRowProps {
    category: SerializableCategoryWithBudget
    monthIncome: number
    categoryExpense: number
}

const BudgetRow = (
    {category, monthIncome, categoryExpense}: BudgetRowProps
) => {
    const budgetPercentage = category.budget[category.budget.length-1].percentage
    const budgetAmount = Math.round((monthIncome * Number(budgetPercentage)) / 100);
    
    const progressPercentage = budgetAmount > 0 
        ? Math.min(Math.round((categoryExpense / budgetAmount) * 100), 100)
        : 100;

    const isOverBudget = categoryExpense > budgetAmount

    return (
        <div 
            className={cn(
                "flex flex-col gap-3",
            )}
        >
            <div className="flex justify-between items-center">
                <div className="flex gap-2 items-center">
                    <Avatar>
                        <AvatarImage src={''}/>
                        <AvatarFallback className="bg-blue-100 text-blue-700">{category.name[0] || ''}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <h3 className="font-medium text-gray-900">{category.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <p>{categoryExpense} € / {budgetAmount} €</p>
                            {isOverBudget && (
                                <Badge variant="destructive" className="gap-1 text-xs">
                                    <AlertTriangleIcon className="w-3 h-3" />
                                    Dépassé
                                </Badge>
                            )} 
                        </div>
                    </div>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <EllipsisVerticalIcon 
                                size={16} 
                                className={"cursor-pointer transition-opacity ease-in-out"}
                            />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <ResponsiveModal
                            title="Modifier la catégorie"
                            trigger={
                                <DropdownMenuItem 
                                    className="gap-2"
                                    onSelect={(e) => e.preventDefault()}
                                >
                                    <Edit2Icon className="w-4 h-4" />
                                    Modifier
                                </DropdownMenuItem>
                            }
                        >
                            <UpdateCategoryForm
                                categoryId={category.id}
                                initialName={category.name}
                                initialPercentage={budgetPercentage}
                            />
                        </ResponsiveModal>
                        <DropdownMenuItem 
                            className="gap-2"
                            onClick={async () => await deleteCategoryAction({id: category.id})}
                        >
                            <Trash2Icon className="w-4 h-4"/>
                            Supprimer
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="flex flex-col gap-1">
                <Progress value={progressPercentage}/>
                <div className="flex justify-between text-sm text-gray-500">
                    <p>{progressPercentage}% utilisé</p>
                    {isOverBudget 
                        ? <p>+{Math.abs(budgetAmount - categoryExpense)} € de dépassement</p> 
                        : <p>{Math.abs(categoryExpense - budgetAmount)} € restant</p>
                    }
                </div>
            </div>
        </div>
    )
}

export default BudgetRow