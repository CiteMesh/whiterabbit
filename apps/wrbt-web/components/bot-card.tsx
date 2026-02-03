import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, GitFork, Clock, Download } from "lucide-react";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";

export interface Bot {
  id: string;
  name: string;
  description: string;
  author: string;
  stars: number;
  forks: number;
  downloads: number;
  updatedAt: string;
  category: string;
  image: string;
  tags: string[];
}

interface BotCardProps {
  bot: Bot;
  onClick: (bot: Bot) => void;
}

export function BotCard({ bot, onClick }: BotCardProps) {
  return (
    <Card className="flex flex-col h-full overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => onClick(bot)}>
      <div className="relative h-48 w-full overflow-hidden bg-muted">
         <ImageWithFallback
            src={bot.image}
            alt={bot.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
         />
         <Badge className="absolute top-2 right-2 bg-background/80 text-foreground hover:bg-background/90 backdrop-blur-sm">
            {bot.category}
         </Badge>
      </div>
      <CardHeader className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="line-clamp-1 text-lg group-hover:text-primary transition-colors">{bot.name}</CardTitle>
            <CardDescription className="line-clamp-1 text-xs mt-1">by {bot.author}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {bot.description}
        </p>
        <div className="flex flex-wrap gap-1">
          {bot.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs px-2 py-0.5 font-normal">
              {tag}
            </Badge>
          ))}
          {bot.tags.length > 3 && (
            <span className="text-xs text-muted-foreground self-center">+{bot.tags.length - 3}</span>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 border-t bg-muted/20 flex justify-between items-center text-xs text-muted-foreground">
        <div className="flex gap-4">
          <div className="flex items-center gap-1 hover:text-foreground">
            <Star className="h-3 w-3" />
            <span>{bot.stars}</span>
          </div>
          <div className="flex items-center gap-1 hover:text-foreground">
            <GitFork className="h-3 w-3" />
            <span>{bot.forks}</span>
          </div>
          <div className="flex items-center gap-1 hover:text-foreground">
            <Download className="h-3 w-3" />
            <span>{bot.downloads}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>{bot.updatedAt}</span>
        </div>
      </CardFooter>
    </Card>
  );
}
