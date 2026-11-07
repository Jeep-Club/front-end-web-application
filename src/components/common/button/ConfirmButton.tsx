import { Button, type ButtonProps } from "./Button";
import { twMerge } from "tailwind-merge";

export function ConfirmButton({ className, ...props }: ButtonProps) {
    return <Button {...props} className={twMerge(className,
        "!bg-red-500 !text-white hover:!bg-red-600 hover:!text-white focus-visible:!bg-red-600 focus-visible:!outline-red-500 disabled:!bg-j-gray-200 disabled:!text-j-gray-500",
    )} />;
}
