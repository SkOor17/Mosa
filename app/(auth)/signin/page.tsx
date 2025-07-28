"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEventHandler, useState } from "react";
import { toast } from "sonner";
import {authClient} from "@/src/lib/auth-client";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/src/components/ui/card";
import {Label} from "@/src/components/ui/label";
import {Input} from "@/src/components/ui/input";
import {Button} from "@/src/components/ui/button";

export default function SignInPage() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        const event = {
            onRequest: () => {
                setIsLoading(true);
            },
            onSuccess: () => {
                router.push("/dashboard");
                router.refresh();
            },
            onError: (ctx: { error: { message: string } }) => {
                console.log("ERROR")
                toast.error(ctx.error.message);
                setIsLoading(false);
            },
        };

        authClient.signIn.email(
            {
                email,
                password,
            },
            event
        );
    };

    return (
        <div className={"flex justify-center pt-12"}>
            <Card className={"w-[500px]"}>
                <CardHeader>
                    <CardTitle>Sign in</CardTitle>
                    <CardDescription>
                        We just need a few details to get you started.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div className="*:not-first:mt-2">
                                <Label htmlFor={`email`}>Email</Label>
                                <Input
                                    id={`email`}
                                    placeholder="hi@yourcompany.com"
                                    type="email"
                                    required
                                    name="email"
                                />
                            </div>
                                <div className="*:not-first:mt-2">
                                    <Label htmlFor={`password`}>Password</Label>
                                    <Input
                                        id={`password`}
                                        placeholder="Enter your password"
                                        type="password"
                                        required
                                        name="password"
                                    />
                                </div>
                        </div>
                        <Button disabled={isLoading} type="submit" className="w-full">
                            Sign in
                        </Button>
                    </form>

                    <p className="text-muted-foreground text-center text-xs">
                        No account ?{" "}
                        <Link className="text-indigo-500" href="/signup">
                            Sing Up
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}