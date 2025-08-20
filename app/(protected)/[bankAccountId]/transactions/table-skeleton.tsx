import React from 'react';
import {Skeleton} from "@/src/components/ui/skeleton";

const TableSkeleton = () => {
    return (
        <div className="flex flex-col space-y-4 w-full pt-6">
            <div className={"flex justify-between"}>
                <Skeleton className="h-6 w-[250px]" />
                <Skeleton className="h-6 w-[150px] hidden md:block" />
            </div>
            <Skeleton className="h-[250px] w-full" />
        </div>
    );
};

export default TableSkeleton;