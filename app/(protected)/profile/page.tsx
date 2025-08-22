import React from 'react';
import {getRequiredUser} from "@/src/lib/auth-session";
import {prisma} from "@/src/lib/prisma";
import AddCategoryButton from "@/src/components/buttons/add-category-button";
import {Card, CardContent, CardHeader, CardTitle} from "@/src/components/ui/card";

const Page = async () => {
    const user = await getRequiredUser()
    const categories = await prisma.category.findMany({
        where: {userId: user.id},
        include: {budget: true}
    });

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
            <Card>
                <CardHeader className={"flex gap-2 justify-between"}>
                    <CardTitle>Mes catégories</CardTitle>
                    <AddCategoryButton/>
                </CardHeader>
                <CardContent>
                    {categories.map((category) => (
                        <p key={category.id}>{category.name} - {category.budget[0]?.percentage?.toString() || 0}%</p>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
};

export default Page;