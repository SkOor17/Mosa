import React from 'react';
import {Skeleton} from "@/src/components/ui/skeleton";

const Loading = () => {
    return (
        <div className={"w-full h-screen pt-6"}>
            <Skeleton className="h-[300px] w-full" />
        </div>
    );
};

export default Loading;