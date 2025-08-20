import {useIsMobile} from "@/src/components/hook/useIsMobile";
import {ReactNode} from "react";
import {Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger} from "@/src/components/ui/drawer";
import {Dialog, DialogHeader, DialogContent, DialogTitle, DialogTrigger} from "@/src/components/ui/dialog";

interface ResponsiveModalProps {
    children: ReactNode
    trigger?: ReactNode
    title: string
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function ResponsiveModal({
    children,
    trigger,
    title,
    open,
    onOpenChange
}: ResponsiveModalProps) {
    const isMobile = useIsMobile()

    if (isMobile) {
        return (
            <Drawer open={open} onOpenChange={onOpenChange}>
                <DrawerTrigger asChild>
                    {trigger}
                </DrawerTrigger>
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>{title}</DrawerTitle>
                    </DrawerHeader>
                    <div className="px-4 pb-4">
                        {children}
                    </div>
                </DrawerContent>
            </Drawer>
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                {children}
            </DialogContent>
        </Dialog>
    )
}