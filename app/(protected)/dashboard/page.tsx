import React from 'react';
import {getRequiredUser} from "@/src/lib/auth-session";

const Dashboard = async () => {
    const user = await getRequiredUser()

    return (
        <div className={"flex justify-center w-full pt-32"}>
            <p className={"text-2xl font-bold"}>
                Welcome back to your dashboard {user.name} !
            </p>
        </div>
    );
};

export default Dashboard;