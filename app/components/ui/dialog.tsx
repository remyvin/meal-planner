"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;

interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>((
  { children, ...props }, 
  ref
) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Content ref={ref} {...props}>
      {children}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
DialogContent.displayName = "DialogContent";

interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

const DialogHeader = React.forwardRef<HTMLDivElement, DialogHeaderProps>((
  { children, ...props }, 
  ref
) => (
  <div ref={ref} {...props}>
    {children}
  </div>
));
DialogHeader.displayName = "DialogHeader";

const DialogTitle = DialogPrimitive.Title;

export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle };