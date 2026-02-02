import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bot, Users, Star } from 'lucide-react'

interface BotCardProps {
  name: string
  description: string
  category: string
  platforms: string[]
  contributors: number
  rating: number
}

export function BotCard({ name, description, category, platforms, contributors, rating }: BotCardProps) {
  return (
    <Card className="group hover:border-primary transition-colors cursor-pointer">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg group-hover:text-primary transition-colors">
                {name}
              </CardTitle>
              <CardDescription className="mt-1">{description}</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge variant="secondary">{category}</Badge>
          {platforms.map((platform) => (
            <Badge key={platform} variant="outline">
              {platform}
            </Badge>
          ))}
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            <span>{contributors} contributors</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-primary text-primary" />
            <span>{rating.toFixed(1)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
