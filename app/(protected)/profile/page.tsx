import React from 'react';
import {getRequiredUser} from "@/src/lib/auth-session";
import {prisma} from "@/src/lib/prisma";
import {Card, CardContent, CardHeader, CardTitle} from "@/src/components/ui/card";
import CategoryCard from "@/app/(protected)/profile/category-card";
import {SerializableCategoryWithBudget, serializeCategory} from "@/src/lib/utils/serialize";

const Page = async () => {
    const user = await getRequiredUser()
    const categories = await prisma.category.findMany({
        where: {userId: user.id},
        include: {budget: true}
    });

    const serializableCategories: SerializableCategoryWithBudget[] = categories.map(serializeCategory)

    return (
        <div className={"flex flex-col gap-4 pt-6"}>
            <Card>
                <CardHeader>
                    <CardTitle>Mon profile</CardTitle>
                </CardHeader>
                <CardContent className={"flex flex-col gap-2"}>
                    <p>{user.name}</p>
                    <p>{user.email}</p>
                </CardContent>
            </Card>
            <CategoryCard categories={serializableCategories}/>
        </div>
    );
};

export default Page;