import { BotHeader } from '@/components/bot-header'
import { BotSidebar } from '@/components/bot-sidebar'
import { BotCard } from '@/components/bot-card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrendingUp, Clock, Star } from 'lucide-react'

const featuredBots = [
  {
    name: 'GPT Assistant Pro',
    description: 'Advanced conversational AI with multi-modal capabilities and context memory',
    category: 'Chat Bot',
    platforms: ['WhatsApp', 'Telegram'],
    contributors: 47,
    rating: 4.8
  },
  {
    name: 'WorkflowMaster',
    description: 'Automate complex business processes with intelligent task routing',
    category: 'Task Automation',
    platforms: ['Slack', 'Discord'],
    contributors: 32,
    rating: 4.6
  },
  {
    name: 'DataSync Agent',
    description: 'Real-time data processing and synchronization across multiple sources',
    category: 'Data Processing',
    platforms: ['Custom API'],
    contributors: 28,
    rating: 4.7
  },
  {
    name: 'SupportBot 360',
    description: 'AI-powered customer support with sentiment analysis and ticket routing',
    category: 'Customer Support',
    platforms: ['WhatsApp', 'Telegram', 'Slack'],
    contributors: 56,
    rating: 4.9
  },
  {
    name: 'ContentCreator AI',
    description: 'Generate blog posts, social media content, and marketing copy',
    category: 'Content Generation',
    platforms: ['Discord'],
    contributors: 41,
    rating: 4.5
  },
  {
    name: 'CodeReview Assistant',
    description: 'Automated code review with best practices and security checks',
    category: 'Development',
    platforms: ['GitHub', 'GitLab'],
    contributors: 62,
    rating: 4.8
  }
]

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <BotHeader />
      
      <div className="flex-1 flex">
        <aside className="hidden md:block w-64 border-r border-border bg-muted/30">
          <BotSidebar />
        </aside>
        
        <main className="flex-1">
          <div className="container max-w-6xl py-8 px-4 md:px-8">
            <div className="mb-8">
              <h1 className="text-4xl font-bold tracking-tight mb-3 text-balance">
                Welcome to OpenClaw Bot Wiki
              </h1>
              <p className="text-lg text-muted-foreground text-pretty max-w-3xl">
                The comprehensive, community-driven database of AI agents and bots. 
                Discover, learn about, and contribute to the growing ecosystem of intelligent automation.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3 mb-8">
              <div className="flex flex-col gap-2 p-4 rounded-lg border border-border bg-card">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Bot className="h-4 w-4" />
                  Total Bots
                </div>
                <div className="text-3xl font-bold">1,247</div>
                <p className="text-xs text-muted-foreground">+89 this month</p>
              </div>
              
              <div className="flex flex-col gap-2 p-4 rounded-lg border border-border bg-card">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Star className="h-4 w-4" />
                  Contributors
                </div>
                <div className="text-3xl font-bold">3,492</div>
                <p className="text-xs text-muted-foreground">Active community</p>
              </div>
              
              <div className="flex flex-col gap-2 p-4 rounded-lg border border-border bg-card">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  Updates Today
                </div>
                <div className="text-3xl font-bold">127</div>
                <p className="text-xs text-muted-foreground">Last updated 2min ago</p>
              </div>
            </div>

            <Tabs defaultValue="featured" className="space-y-6">
              <TabsList>
                <TabsTrigger value="featured" className="gap-2">
                  <Star className="h-4 w-4" />
                  Featured
                </TabsTrigger>
                <TabsTrigger value="trending" className="gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Trending
                </TabsTrigger>
                <TabsTrigger value="recent" className="gap-2">
                  <Clock className="h-4 w-4" />
                  Recent
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="featured" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {featuredBots.map((bot) => (
                    <BotCard key={bot.name} {...bot} />
                  ))}
                </div>
                <div className="flex justify-center pt-4">
                  <Button variant="outline">Load More Bots</Button>
                </div>
              </TabsContent>
              
              <TabsContent value="trending" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {featuredBots.slice(0, 4).map((bot) => (
                    <BotCard key={bot.name} {...bot} />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="recent" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {featuredBots.slice(2).map((bot) => (
                    <BotCard key={bot.name} {...bot} />
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-12 rounded-lg border border-border bg-muted/30 p-6">
              <h2 className="text-2xl font-bold mb-3">Contribute to OpenClaw Wiki</h2>
              <p className="text-muted-foreground mb-4 text-pretty">
                Help us build the most comprehensive bot database. Share your bot configurations, 
                improve documentation, and help others discover powerful AI agents.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button>Add a Bot</Button>
                <Button variant="outline">Edit Documentation</Button>
                <Button variant="outline">Join Community</Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
