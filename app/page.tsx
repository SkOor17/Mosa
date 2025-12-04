import {Button} from "@/src/components/ui/button";
import Link from "next/link";
import {LogInIcon} from "lucide-react";

export default async function Home() {
    return (
        <div className={"flex flex-col gap-6 justify-center items-center w-full h-screen"}>
            <div className={"gap-2 flex flex-col items-center"}>
                <p className={"text-2xl uppercase font-bold"}> Welcome to Mosa </p>
                <p className={""}> Your financial app to reach your goals </p>
            </div>
            <Link href={"/signin"}>
                <Button> <LogInIcon/>{"Sign in !"}</Button>
            </Link>
        </div>
    );
}
