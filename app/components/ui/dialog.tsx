"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogPortal = DialogPrimitive.Portal
const DialogOverlay = DialogPrimitive.Overlay
const DialogContent = DialogPrimitive.Content
const DialogHeader = React.forwardRef
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={className}
    {...props}
  />
))
DialogHeader.displayName = "DialogHeader"

const DialogTitle = DialogPrimitive.Title

export {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogTitle,
}