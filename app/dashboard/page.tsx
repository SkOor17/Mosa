import React from 'react';
import {getUser} from "@/src/lib/auth-session";
import SignoutButton from "@/src/components/ui/signout-button";
import Link from "next/link";
import {Button} from "@/src/components/ui/button";

const Dashboard = async () => {
    const user = await getUser()

    return (
        <div className={"flex flex-col gap-6 justify-center items-center w-full h-screen"}>
            <p className={"text-2xl uppercase font-bold"}> Mosa dashboard </p>
            {user ?
                <div className={"flex gap-2 items-center"}>
                    <p>Hello {user.name}</p>
                    <SignoutButton/>
                </div> :
                <div className={"flex gap-2 items-center"}>
                    <p>Not connected</p>
                    <Link href={"/signin"}>
                        <Button>Sign in</Button>
                    </Link>
                </div>
            }
        </div>
    );
};

export default Dashboard;