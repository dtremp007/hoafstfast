import * as React from "react"
import {cn} from "@/lib/utils";

export interface SelectProps
    extends React.InputHTMLAttributes<HTMLSelectElement> {
}

const NativeSelect = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({className, type, ...props}, ref) => {
        return (
            <select
                className={cn(
                    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
                ref={ref}
                {...props}
            >
                {props.children}
            </select>
        )
    }
)

NativeSelect.displayName = "Select"

export {NativeSelect}


