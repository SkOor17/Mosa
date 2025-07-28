import React from 'react';
import {getRequiredUser} from "@/src/lib/auth-session";
import AvatarHeader from "@/src/components/ui/avatar-header";
import NavigationBurger from "@/src/components/ui/navigation-burger";

const HeaderApp = async () => {
    const user = await getRequiredUser()

    return (
        <div className={"w-full flex items-center justify-between"}>
            <div className={"flex gap-2 items-center"}>
                <NavigationBurger/>
                <p className={"text-2xl"}>Mosa</p>
            </div>
            <AvatarHeader user={user}/>
        </div>
    );
};

export default HeaderApp;