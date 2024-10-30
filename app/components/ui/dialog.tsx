"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogContent = React.forwardRef<HTMLDivElement>((
  { children, ...props }, 
  ref
) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Content ref={ref} {...props}>
      {children}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));

const DialogHeader = React.forwardRef<HTMLDivElement>((
  { ...props }, 
  ref
) => (
  <div ref={ref} {...props} />
));

const DialogTitle = DialogPrimitive.Title;

export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle };