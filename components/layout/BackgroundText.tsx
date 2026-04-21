"use client";

import { cn } from "@/lib/utils";
import {
  Code2,
  Cpu,
  Database,
  Globe,
  Laptop,
  Monitor,
  Radio,
  Server,
  Shield,
  Smartphone,
  Wifi,
} from "lucide-react";

type BackgroundTextProps = {
  className?: string;
  iconSize?: number;
  mode?: "hero" | "fixed";
};

export function BackgroundText({
  className,
  iconSize = 34,
  mode = "hero",
}: BackgroundTextProps) {
  const icons = [
    Code2,
    Cpu,
    Database,
    Globe,
    Laptop,
    Monitor,
    Radio,
    Server,
    Shield,
    Smartphone,
    Wifi,
  ];

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none overflow-hidden",
        mode === "fixed"
          ? "fixed left-0 right-0 top-0 -z-10"
          : "absolute inset-0 -z-10",
        className
      )}
      style={{
        WebkitMaskImage:
          "linear-gradient(to bottom, rgba(0,0,0,1), rgba(0,0,0,1) 55%, rgba(0,0,0,0) 100%)",
        maskImage:
          "linear-gradient(to bottom, rgba(0,0,0,1), rgba(0,0,0,1) 55%, rgba(0,0,0,0) 100%)",
      }}
    >
      {/* Repeated tech icons with higher motion (subtle + non-blocking) */}
      <div className="absolute left-1/2 top-1/2 h-[160vmax] w-[160vmax] -translate-x-1/2 -translate-y-1/2 rotate-[-18deg]">
        <div className="background-tech-move absolute inset-0">
          <div className="flex flex-col gap-10 opacity-[0.11] dark:opacity-[0.085]">
            {Array.from({ length: 20 }).map((_, row) => (
              <div
                key={row}
                className={cn(
                  "flex items-center",
                  row % 2 === 0 ? "translate-x-[-6%]" : "translate-x-[-16%]"
                )}
              >
                {Array.from({ length: 22 }).map((__, i) => {
                  const Icon = icons[(row + i) % icons.length];
                  return (
                    <span
                      key={i}
                      className="mx-6 inline-flex h-14 w-14 items-center justify-center text-[#f65f4c]"
                    >
                      <Icon size={iconSize} strokeWidth={1.6} />
                    </span>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
