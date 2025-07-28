import { headers } from "next/headers";
import { unauthorized } from "next/navigation";
import { auth } from "./auth"; // path to your Better Auth server instance

// Retrieve the user of the session
export const getUser = async () => {
    const session = await auth.api.getSession({
        headers: await headers(), // you need to pass the headers object.
    });

    return session?.user;
};

// Check if a user is already connected
export const getRequiredUser = async () => {
    const user = await getUser();

    if (!user) unauthorized();

    return user;
};