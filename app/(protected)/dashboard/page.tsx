import React from 'react';
import {getRequiredUser} from "@/src/lib/auth-session";
import {prisma} from "@/src/lib/prisma";
import BankAccountCard from "@/app/(protected)/dashboard/bank-account-card";
import AddBankAccountCard from "@/app/(protected)/dashboard/add-bank-account-card";
import SummaryAccountChart from "@/app/(protected)/dashboard/summary-account-chart";
import AddTransactionButton from "@/src/components/buttons/add-transaction-button";

const Dashboard = async () => {
        const user = await getRequiredUser();

        // Vérification que l'utilisateur existe
        if (!user || !user.id) {
            return <div>Erreur: utilisateur non trouvé</div>;
        }

        const categories = await prisma.category.findMany({
            where: {
                userId: user.id
            }
        }) || []; // Fallback vers tableau vide

        const bankAccounts = await prisma.bankAccountUser.findMany({
            where: {
                userId: user.id
            },
            include: {
                bankAccount: true
            }
        }) || []; // Fallback vers tableau vide

        // Filtrer les comptes bancaires valides et créer bankAccountsProp
        const validBankAccounts = bankAccounts.filter(ba => ba?.bankAccount?.id && ba?.bankAccount?.name);
        const bankAccountsProp = validBankAccounts.map(ba => ({
            id: ba.bankAccount.id,
            name: ba.bankAccount.name
        }));

        return (
            <div className={"flex flex-col gap-6 pt-6"}>
                {/*First section*/}
                <div className={"flex flex-col gap-4 md:hidden"}>
                    <div>
                        <h2 className={"text-xl font-semibold"}>Dashboard</h2>
                        <p className={"text-sm text-gray-600"}>{"Vue d\'ensemble"}</p>
                    </div>
                    {categories.length > 0 && bankAccountsProp.length > 0 && (
                        <div className={"md:hidden"}>
                            <AddTransactionButton categories={categories} bankAccounts={bankAccountsProp}/>
                        </div>
                    )}
                </div>

                <div className={"flex flex-col gap-6 md:flex-row-reverse"}>
                    {/*Bank accounts section*/}
                    <div className={"flex flex-col gap-4 md:min-w-[300px] lg:min-w-[600px]"}>
                        <h2 className={"text-xl font-semibold"}>Comptes</h2>
                        <div className={"flex gap-4 overflow-auto pb-4 md:flex-wrap"}>
                            {validBankAccounts.length > 0 ? (
                                validBankAccounts.map((bankAccount) => {
                                    // Vérification de sécurité supplémentaire
                                    if (!bankAccount?.bankAccount) {
                                        return null;
                                    }

                                    const safeBankAccount = {
                                        ...bankAccount.bankAccount,
                                        // Conversion sécurisée des Decimal
                                        initialAmount: bankAccount.bankAccount.initialAmount
                                            ? Number(bankAccount.bankAccount.initialAmount)
                                            : 0,
                                        currentAmount: bankAccount.bankAccount.currentAmount
                                            ? Number(bankAccount.bankAccount.currentAmount)
                                            : 0,
                                    }

                                    return (
                                        <BankAccountCard
                                            key={bankAccount.id}
                                            bankAccount={safeBankAccount}
                                        />
                                    )
                                })
                            ) : (
                                <div className="text-gray-500">Aucun compte bancaire trouvé</div>
                            )}
                            <AddBankAccountCard/>
                        </div>
                    </div>

                    {/*Summary section*/}
                    <div className={"flex flex-col gap-4 w-full"}>
                        <h2 className={"text-xl font-semibold"}>Synthèse des comptes</h2>
                        {validBankAccounts.length > 0 ? (
                            <SummaryAccountChart
                                bankAccounts={validBankAccounts.map(ba => ({
                                    id: ba.bankAccount.id,
                                    name: ba.bankAccount.name,
                                    currentAmount: ba.bankAccount.currentAmount
                                        ? Number(ba.bankAccount.currentAmount)
                                        : 0
                                }))}
                            />
                        ) : (
                            <div className="text-gray-500">Aucune donnée à afficher</div>
                        )}
                        {categories.length > 0 && bankAccountsProp.length > 0 && (
                            <div className={"hidden md:block"}>
                                <AddTransactionButton categories={categories} bankAccounts={bankAccountsProp}/>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
};

export default Dashboard;