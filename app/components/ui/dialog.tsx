"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogContent = DialogPrimitive.Content
const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div {...props} />
)
const DialogTitle = DialogPrimitive.Title

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
}