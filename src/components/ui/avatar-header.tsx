"use client"

import React from 'react';
import {Avatar, AvatarFallback, AvatarImage} from "@/src/components/ui/avatar";
import {User} from "better-auth";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator
} from "@/src/components/ui/dropdown-menu";
import {authClient} from "@/src/lib/auth-client";
import {useRouter} from "next/navigation";
import {LogOutIcon, UserIcon} from "lucide-react";
import Link from "next/link";

const AvatarHeader = ({ user }: { user: User }) => {
    const router = useRouter()
    const handleDisconnect = async () => {
        await authClient.signOut()
        router.replace("/")
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <Avatar className={"bg-gray-200 cursor-pointer"}>
                    <AvatarImage src={user.image ?? ""}/>
                    <AvatarFallback>{`${user?.name?.[0]?.toUpperCase() ?? ""}${user?.name?.split(" ")?.[1]?.[0]?.toUpperCase() ?? ""}`}</AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48" align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator/>
                <DropdownMenuGroup>
                    <Link href={"/profile"}>
                        <DropdownMenuItem className={"cursor-pointer"}>
                                <UserIcon/> My profile
                        </DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem onClick={handleDisconnect} className={"cursor-pointer"}>
                        <LogOutIcon/> Disconnect
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default AvatarHeader;