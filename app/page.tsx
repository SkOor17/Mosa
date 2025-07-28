import {Button} from "@/src/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className={"flex flex-col gap-6 justify-center items-center w-full h-screen"}>
        <p className={"text-2xl uppercase font-bold"}> Hello, this is Mosa </p>
        <div className={"flex gap-2"}>
            <Link href={"/signin"}>
                <Button> Sign in </Button>
            </Link>
            <Link href={"/signup"}>
                <Button> Sign up </Button>
            </Link>
        </div>
    </div>
  );
}
