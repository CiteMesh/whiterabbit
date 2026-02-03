"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, GitFork, Clock, Download } from "lucide-react"
import Image from 'next/image'

export interface Bot {
  id: string
  name: string
  description: string
  author: string
  stars: number
  forks: number
  downloads: number
  updatedAt: string
  category: string
  image?: string
  tags: string[]
}

interface BotCardProps {
  bot: Bot
  onClick: (bot: Bot) => void
}

export function BotCardNew({ bot, onClick }: BotCardProps) {
  return (
    <Card 
      className="flex flex-col h-full overflow-hidden transition-all duration-300 cursor-pointer group hover:shadow-xl hover:-translate-y-1 hover:border-primary/20" 
      onClick={() => onClick(bot)}
    >
      <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-muted via-muted/80 to-muted">
         {bot.image ? (
           <Image
              src={bot.image}
              alt={bot.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
           />
         ) : (
           <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-primary/10 via-primary/5 to-accent/5">
             <span className="text-5xl font-bold text-primary/15">{bot.name[0]}</span>
           </div>
         )}
         <Badge className="absolute top-3 right-3 bg-background/90 text-foreground hover:bg-background backdrop-blur-md border-0 shadow-lg">
            {bot.category}
         </Badge>
      </div>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <div className="space-y-1.5 flex-1 min-w-0">
            <CardTitle className="line-clamp-1 text-base font-semibold group-hover:text-primary transition-colors duration-300">{bot.name}</CardTitle>
            <CardDescription className="line-clamp-1 text-xs">by {bot.author}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-3 pb-4">
        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
          {bot.description}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {bot.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs px-2.5 py-0.5 font-normal rounded-full">
              {tag}
            </Badge>
          ))}
          {bot.tags.length > 3 && (
            <span className="text-xs text-muted-foreground self-center ml-1">+{bot.tags.length - 3}</span>
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t bg-muted/30 flex justify-between items-center text-xs text-muted-foreground pt-3">
        <div className="flex gap-3">
          <div className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer">
            <Star className="h-3.5 w-3.5" />
            <span className="font-medium">{bot.stars.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer">
            <GitFork className="h-3.5 w-3.5" />
            <span className="font-medium">{bot.forks}</span>
          </div>
          <div className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer">
            <Download className="h-3.5 w-3.5" />
            <span className="font-medium">{bot.downloads.toLocaleString()}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          <span>{bot.updatedAt}</span>
        </div>
      </CardFooter>
    </Card>
  )
}
