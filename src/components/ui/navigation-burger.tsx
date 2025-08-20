"use client"

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
import {toast} from "sonner";

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
                        <Link href={"/dashboard"} className={"w-full flex gap-2"} onClick={() => toast.info("En développement")}>
                            <ChartLineIcon/> Summary
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <Link href={"/dashboard"} className={"w-full flex gap-2"} onClick={() => toast.info("En développement")}>
                            <TargetIcon/> Goals
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default NavigationBurger;