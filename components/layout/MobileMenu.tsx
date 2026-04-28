"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";

interface MobileMenuProps {
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  triggerClassName?: string;
  triggerChild?: React.ReactNode; // In case we want to customize the trigger content itself
  title?: string;
  contentClassName?: string;
}

export function MobileMenu({
  children,
  side = "right",
  triggerClassName = "h-9 w-9",
  triggerChild = <Menu className="h-5 w-5" />,
  title = "Menú de navegación",
  contentClassName = "w-[300px] p-0",
}: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the menu automatically when the route changes
  useEffect(() => {
    // using requestAnimationFrame ensures we don't trigger cascading renders
    const raf = requestAnimationFrame(() => setOpen(false));
    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={<Button variant="ghost" size="icon" className={triggerClassName} />}
      >
        {triggerChild}
        <span className="sr-only">Menú</span>
      </SheetTrigger>
      <SheetContent side={side} className={contentClassName}>
        <SheetTitle className="sr-only">{title}</SheetTitle>
        {children}
      </SheetContent>
    </Sheet>
  );
}
