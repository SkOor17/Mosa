import { PropsWithChildren } from "react";
import {getRequiredUser} from "@/src/lib/auth-session";
import AvatarHeader from "@/src/components/ui/avatar-header";

export default async function Layout(props: PropsWithChildren) {
    const user = await getRequiredUser();

    return (
        <div className={"w-full h-screen p-6"}>
            <div className={"flex justify-end"}>
                <AvatarHeader user={user}/>
            </div>
            {props.children}
        </div>
    );
}