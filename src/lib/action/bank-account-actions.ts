"use server"

import {z} from "zod";
import {prisma} from "@/src/lib/prisma";
import {actionClient} from "@/src/lib/action";
import {revalidatePath} from "next/cache";
import {getRequiredUser} from "@/src/lib/auth-session";

const AddBankAccountSchema = z.object({
    name: z.string().min(1),
    initialAmount: z.coerce.number().nonnegative(),
})

export const addBankAccountAction = actionClient
    .inputSchema(AddBankAccountSchema)
    .action(async ({parsedInput: {name, initialAmount}}) => {
        const user = await getRequiredUser()

        const bankAccount = await prisma.bankAccount.create({
            data: {
                name,
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

const RemoveBankAccountSchema = z.object({
    id: z.number().min(0)
})

export const removeBankAccountAction = actionClient
    .inputSchema(RemoveBankAccountSchema)
    .action(async ({ parsedInput: { id } }) => {
        const user = await getRequiredUser();

        // Vérifier que l'utilisateur est bien propriétaire du compte
        const bankAccountUser = await prisma.bankAccountUser.findFirst({
            where: {
                bankAccountId: id,
                userId: user.id,
                permission: 'owner',
            },
        });

        if (!bankAccountUser) {
            throw new Error('Unauthorized or bank account not found');
        }

        await prisma.$transaction([
            // Supprimer les transactions liées
            prisma.transaction.deleteMany({
                where: { bankAccountId: id },
            }),

            // Supprimer les liens user ↔ account
            prisma.bankAccountUser.deleteMany({
                where: { bankAccountId: id },
            }),

            // Supprimer le compte lui-même
            prisma.bankAccount.delete({
                where: { id },
            }),
        ]);

        revalidatePath("/dasboard")
        return { success: true };
    });