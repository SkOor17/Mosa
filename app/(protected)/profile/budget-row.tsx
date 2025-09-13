"use client"

import { UpdateCategoryForm } from "@/src/components/forms/update-category-form"
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/src/components/ui/hover-card"
import { Progress } from "@/src/components/ui/progress"
import { ResponsiveModal } from "@/src/components/ui/responsive-modal"
import { deleteCategoryAction } from "@/src/lib/action/category-action"
import { SerializableCategoryWithBudget } from "@/src/lib/utils/serialize"
import { EditIcon, TrashIcon, TriangleAlertIcon } from "lucide-react"

interface BudgetRowProps {
    category: SerializableCategoryWithBudget
    monthIncome: number
    categoryExpense: number
    readMode?: boolean
}

const BudgetRow = (
    {category, monthIncome, categoryExpense, readMode}:
    BudgetRowProps
) => {
    const currentMonthBudget = category.budget[category.budget.length-1]
    const percentage = currentMonthBudget.percentage || 0;
    
    const calculatedBudget = Math.round((monthIncome * Number(percentage)) / 100);
    
    const calculatedExpense = calculatedBudget > 0 
        ? Math.round((categoryExpense / calculatedBudget) * 100)
        : 0;

    const displayExpensePercentage = Math.min(calculatedExpense, 100);

    return (
        <div className={"flex justify-between items-center"}>
            <HoverCard>
                <HoverCardTrigger>
                    <div className="flex flex-col gap-1 cursor-pointer">
                        <div className="flex gap-2 items-center">
                            <p>{`${category.name} - ${calculatedBudget}€`}</p>
                            {displayExpensePercentage > 80 && <TriangleAlertIcon size={18}/>}
                        </div>
                        <Progress value={displayExpensePercentage} max={100}/>
                    </div>
                </HoverCardTrigger>
                <HoverCardContent className="w-fit">
                    <p>{displayExpensePercentage}% - {categoryExpense}€</p>
                </HoverCardContent>
            </HoverCard>
            {!readMode &&
                <div className={"flex gap-2"}>
                    <ResponsiveModal
                        title={'Modifier la catégorie'}
                        trigger={<EditIcon size={20} className={"cursor-pointer"}/>}
                    >
                        <UpdateCategoryForm
                            categoryId={category.id}
                            initialName={category.name}
                            initialPercentage={Number(currentMonthBudget?.percentage) || 0}
                        />
                    </ResponsiveModal>
                    <TrashIcon
                        size={20}
                        className={"cursor-pointer"}
                        onClick={async () => await deleteCategoryAction({id: category.id})}
                    />
                </div>
            }
        </div>
    )
}

export default BudgetRow