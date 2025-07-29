"use server"

import {z} from "zod";
import {prisma} from "@/src/lib/prisma";
import {actionClient} from "@/src/lib/action";
import {revalidatePath} from "next/cache";
import {getRequiredUser} from "@/src/lib/auth-session";

const BankAccountSchema = z.object({
    name: z.string().min(1),
    type: z.string().min(1),
    initialAmount: z.coerce.number().nonnegative(),
})

export const addBankAccountAction = actionClient
    .inputSchema(BankAccountSchema)
    .action(async ({parsedInput: {name, type, initialAmount}}) => {
        const user = await getRequiredUser()

        const bankAccount = await prisma.bankAccount.create({
            data: {
                name,
                type,
                initialAmount,
                currentAmount: initialAmount,
                users: {
                    create: {
                        userId: user.id,
                        permission: 'owner',
                    }
                }
            },
        })

        revalidatePath("/dasboard")
        return {id: bankAccount.id, name: bankAccount.name};
    })