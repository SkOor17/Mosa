import { PropsWithChildren } from "react";
import {getRequiredUser} from "@/src/lib/auth-session";

export default async function Layout(props: PropsWithChildren) {
    await getRequiredUser();
    return (
        <div>
            {props.children}
        </div>
    );
}