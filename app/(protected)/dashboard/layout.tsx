import { PropsWithChildren } from "react";
import HeaderApp from "@/src/components/ui/header";

export default async function Layout(props: PropsWithChildren) {
    return (
        <div className={"w-full h-screen"}>
            <HeaderApp/>
            {props.children}
        </div>
    );
}