"use client"

import React from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, User, Terminal, Menu } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"

interface NavbarProps {
  onNavigate?: (page: string) => void
  currentPage?: string
  searchQuery: string
  setSearchQuery: (query: string) => void
}

export function Navbar({ onNavigate, currentPage = 'home', searchQuery, setSearchQuery }: NavbarProps) {
  const handleNavigate = (page: string) => {
    if (onNavigate) {
      onNavigate(page)
    }
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4">
        <div className="mr-8 hidden md:flex cursor-pointer" onClick={() => handleNavigate('home')}>
          <div className="flex items-center gap-2 font-bold text-xl">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Terminal className="h-5 w-5" />
            </div>
            <span>OpenClaw<span className="text-muted-foreground font-normal">Wiki</span></span>
          </div>
        </div>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden mr-4">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <div className="flex flex-col gap-4 mt-8">
              <Button variant="ghost" className="justify-start" onClick={() => handleNavigate('home')}>
                Home
              </Button>
              <Button variant="ghost" className="justify-start" onClick={() => handleNavigate('create')}>
                Create Bot
              </Button>
              <Button variant="ghost" className="justify-start" onClick={() => handleNavigate('browse')}>
                Browse
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        <div className="hidden md:flex items-center gap-6 text-sm font-medium mr-4">
          <button 
            onClick={() => handleNavigate('home')}
            className={`transition-colors hover:text-foreground/80 ${currentPage === 'home' ? 'text-foreground' : 'text-foreground/60'}`}
          >
            Home
          </button>
          <button 
             onClick={() => handleNavigate('browse')}
            className={`transition-colors hover:text-foreground/80 ${currentPage === 'browse' ? 'text-foreground' : 'text-foreground/60'}`}
          >
            Browse
          </button>
          <button 
             onClick={() => handleNavigate('docs')}
            className={`transition-colors hover:text-foreground/80 ${currentPage === 'docs' ? 'text-foreground' : 'text-foreground/60'}`}
          >
            Documentation
          </button>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-2">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search bots..."
                className="h-9 w-full rounded-md border border-input bg-background pl-8 sm:w-[300px] md:w-[400px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <ThemeToggle />
          <Button size="sm" onClick={() => handleNavigate('create')} className="hidden sm:flex">
            <Plus className="mr-2 h-4 w-4" />
            New Bot
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>My Bots</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}
