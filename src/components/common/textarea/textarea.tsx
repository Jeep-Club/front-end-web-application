'use client'

import { twMerge } from "tailwind-merge";
import { useId } from "react";

export interface TextareaProps extends Omit<React.ComponentProps<'textarea'>, 'name'>{
    label: string;
    name: string;
    error?: string;
    value?: string;
}

