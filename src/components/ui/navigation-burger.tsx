import React from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup, DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger
} from "@/src/components/ui/dropdown-menu";
import {ChartLineIcon, MenuIcon, TargetIcon} from "lucide-react";
import Link from "next/link";

const NavigationBurger = () => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <MenuIcon className={"cursor-pointer"}/>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
                <DropdownMenuLabel>Navigation</DropdownMenuLabel>
                <DropdownMenuGroup>
                    <DropdownMenuItem>
                        <Link href={"/summary"} className={"w-full flex gap-2"}>
                            <ChartLineIcon/> Summary
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <Link href={"/goals"} className={"w-full flex gap-2"}>
                            <TargetIcon/> Goals
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default NavigationBurger;