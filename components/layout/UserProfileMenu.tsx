"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LayoutDashboard, Settings, LogOut, ChevronDown } from "lucide-react";

interface UserProfileMenuProps {
  showName?: boolean;
}

export function UserProfileMenu({ showName = true }: UserProfileMenuProps) {
  const { user, profile, signOut, isAdmin, isInstructor } = useAuth();

  if (!user || !profile) return null;

  const initials =
    profile.full_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className={
              showName 
                ? "flex items-center gap-2 px-2 h-auto py-1.5 hover:bg-accent" 
                : "relative h-9 w-9 rounded-full ring-2 ring-primary/10 p-0 overflow-hidden"
            }
          />
        }
      >
        <Avatar className={showName ? "h-8 w-8 ring-2 ring-primary/20" : "h-9 w-9"}>
          <AvatarImage
            src={profile.avatar_url || undefined}
            alt={profile.full_name || "Avatar"}
          />
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        {showName && (
          <>
            <span className="hidden lg:block text-sm font-medium max-w-[120px] truncate">
              {profile.full_name || "Usuario"}
            </span>
            <ChevronDown className="hidden lg:block h-3.5 w-3.5 text-muted-foreground" />
          </>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-2">
          <p className="text-sm font-semibold truncate">
            {profile.full_name || "Usuario"}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {user.email || "No email"}
          </p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/dashboard" />}>
          <LayoutDashboard className="h-4 w-4" />
          Mi Dashboard
        </DropdownMenuItem>
        {(isAdmin || isInstructor) && (
          <DropdownMenuItem render={<Link href="/admin" />}>
            <Settings className="h-4 w-4" />
            Panel de Admin
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={signOut}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Cerrar Sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}