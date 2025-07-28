"use client"

import React from 'react';
import {Button} from "@/src/components/ui/button";
import {authClient} from "@/src/lib/auth-client";
import {ArrowLeftToLineIcon} from "lucide-react";
import {useRouter} from "next/navigation";

const SignoutButton = () => {
    const router = useRouter();

    return (
        <Button
            onClick={async () => {
                await authClient.signOut()
                router.replace("/")
            }}
        >
            <ArrowLeftToLineIcon/>
        </Button>
    );
};

export default SignoutButton;