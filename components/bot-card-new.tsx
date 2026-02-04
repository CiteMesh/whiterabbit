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
      className="flex flex-col h-full overflow-hidden transition-all cursor-pointer group hover:shadow-lg" 
      onClick={() => onClick(bot)}
    >
      <div className="relative h-40 w-full overflow-hidden bg-muted">
         {bot.image ? (
           <Image
              src={bot.image}
              alt={bot.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
           />
         ) : (
           <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
             <span className="text-4xl font-bold text-primary/20">{bot.name[0]}</span>
           </div>
         )}
         <Badge className="absolute top-2 right-2 text-xs">
            {bot.category}
         </Badge>
      </div>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="line-clamp-1 text-base group-hover:text-primary transition-colors">{bot.name}</CardTitle>
            <CardDescription className="line-clamp-1 text-xs mt-1">by {bot.author}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {bot.description}
        </p>
        <div className="flex flex-wrap gap-1">
          {bot.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs px-2 py-0 font-normal">
              {tag}
            </Badge>
          ))}
          {bot.tags.length > 3 && (
            <span className="text-xs text-muted-foreground self-center">+{bot.tags.length - 3}</span>
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t flex justify-between items-center text-xs text-muted-foreground">
        <div className="flex gap-3">
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3" />
            <span>{bot.stars.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <GitFork className="h-3 w-3" />
            <span>{bot.forks}</span>
          </div>
          <div className="flex items-center gap-1">
            <Download className="h-3 w-3" />
            <span>{bot.downloads.toLocaleString()}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>{bot.updatedAt}</span>
        </div>
      </CardFooter>
    </Card>
  )
}
