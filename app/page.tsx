import {Button} from "@/src/components/ui/button";

export default function Home() {
  return (
    <div className={"flex flex-col gap-6 justify-center items-center w-full h-screen"}>
        <p className={"text-2xl uppercase font-bold"}> Hello, this is Mosa </p>
        <Button> Click me </Button>
    </div>
  );
}
