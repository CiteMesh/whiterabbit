"use client"

import React, { useState } from 'react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { BotCardNew, Bot } from '@/components/bot-card-new'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Sparkles, Filter } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

// Mock data - will be replaced with API calls to backend (NEXT_PUBLIC_WRBT_API_BASE)
const mockBots: Bot[] = [
  {
    id: '1',
    name: 'Instagram Scraper Pro',
    description: 'Advanced Instagram data extraction tool with support for posts, stories, and user profiles. Handles rate limiting and proxies automatically.',
    author: 'datascraper',
    stars: 1234,
    forks: 234,
    downloads: 5678,
    updatedAt: '2d ago',
    category: 'Social Media',
    tags: ['instagram', 'scraping', 'social-media', 'data-extraction'],
  },
  {
    id: '2',
    name: 'Crypto Trading Bot',
    description: 'Automated cryptocurrency trading bot with multiple strategy support. Connects to major exchanges via API.',
    author: 'cryptodev',
    stars: 2341,
    forks: 445,
    downloads: 8901,
    updatedAt: '1w ago',
    category: 'Finance',
    tags: ['crypto', 'trading', 'bot', 'finance'],
  },
  {
    id: '3',
    name: 'SEO Audit Tool',
    description: 'Comprehensive SEO analysis tool that crawls websites and generates detailed reports on optimization opportunities.',
    author: 'seomaster',
    stars: 876,
    forks: 123,
    downloads: 3456,
    updatedAt: '3d ago',
    category: 'SEO',
    tags: ['seo', 'audit', 'website', 'analytics'],
  },
  {
    id: '4',
    name: 'Email Validator',
    description: 'Bulk email validation service that checks syntax, domain, and mailbox existence. Fast and reliable.',
    author: 'emailpro',
    stars: 654,
    forks: 89,
    downloads: 2345,
    updatedAt: '5d ago',
    category: 'Utilities',
    tags: ['email', 'validation', 'bulk', 'verification'],
  },
  {
    id: '5',
    name: 'E-commerce Price Monitor',
    description: 'Track prices across multiple e-commerce platforms. Get alerts when prices drop below your target.',
    author: 'pricetracker',
    stars: 1543,
    forks: 267,
    downloads: 6789,
    updatedAt: '1d ago',
    category: 'E-commerce',
    tags: ['e-commerce', 'price', 'monitoring', 'alerts'],
  },
  {
    id: '6',
    name: 'Content Generator AI',
    description: 'AI-powered content generation bot for blogs, social media, and marketing materials. Uses latest LLM models.',
    author: 'aiwriter',
    stars: 3210,
    forks: 543,
    downloads: 12345,
    updatedAt: '4h ago',
    category: 'Marketing',
    tags: ['ai', 'content', 'generation', 'llm'],
  },
  {
    id: '7',
    name: 'LinkedIn Auto Connect',
    description: 'Automate LinkedIn connection requests with personalized messages. Smart targeting and rate limiting.',
    author: 'linkedinpro',
    stars: 987,
    forks: 176,
    downloads: 4321,
    updatedAt: '1w ago',
    category: 'Social Media',
    tags: ['linkedin', 'networking', 'automation', 'outreach'],
  },
  {
    id: '8',
    name: 'API Testing Suite',
    description: 'Comprehensive API testing framework with support for REST, GraphQL, and WebSocket protocols.',
    author: 'tester123',
    stars: 765,
    forks: 134,
    downloads: 2987,
    updatedAt: '6d ago',
    category: 'Testing',
    tags: ['api', 'testing', 'automation', 'qa'],
  },
]

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null)

  const handleBotClick = (bot: Bot) => {
    setSelectedBot(bot)
    console.log('[v0] Bot clicked:', bot.name)
    // TODO: Navigate to bot detail page or open modal
  }

  const handleNavigate = (page: string) => {
    console.log('[v0] Navigate to:', page)
    // TODO: Implement routing or page state management
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery}
        onNavigate={handleNavigate}
        currentPage="home"
      />
      
      {/* Hero Section */}
      <section className="bg-background py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center space-y-6">
          <Badge variant="secondary" className="mb-2">v2.0 Now Available</Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-balance">
            The Encyclopedia of Bots
          </h1>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-lg text-pretty">
            Discover, share, and collaborate on automation scripts. The largest open-source database for OpenClaw bots.
          </p>
          <div className="flex w-full max-w-lg items-center gap-2 mx-auto pt-4">
            <Input 
              type="text" 
              placeholder="Search for bots, scrapers, automation..." 
              className="h-11" 
            />
            <Button className="h-11 px-6">Search</Button>
          </div>
          
           <div className="flex flex-wrap justify-center gap-2 pt-4 text-sm text-muted-foreground">
             <span>Popular:</span>
             <span className="cursor-pointer hover:text-primary hover:underline">Instagram Scraper</span>
             <span>•</span>
             <span className="cursor-pointer hover:text-primary hover:underline">Crypto Trading</span>
             <span>•</span>
             <span className="cursor-pointer hover:text-primary hover:underline">SEO Audit</span>
           </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-yellow-500" />
                    Featured Bots
                </h2>
            </div>
            <div className="flex items-center gap-3">
                 <Tabs defaultValue="all" className="w-auto">
                    <TabsList>
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="trending">Trending</TabsTrigger>
                        <TabsTrigger value="new">New</TabsTrigger>
                    </TabsList>
                </Tabs>
                <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                </Button>
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {mockBots.map((bot) => (
            <BotCardNew key={bot.id} bot={bot} onClick={handleBotClick} />
          ))}
        </div>
        
         <div className="flex justify-center mt-12">
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => handleNavigate('browse')}
            >
              View All Bots
            </Button>
         </div>
      </section>
      
      {/* Categories Section */}
      <section className="bg-muted/30 py-16 px-4 mt-12">
         <div className="container mx-auto">
             <h2 className="text-2xl font-bold mb-8 text-center">Browse by Category</h2>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                 {['E-commerce', 'Social Media', 'Finance', 'Data Mining', 'Testing', 'Utilities', 'SEO', 'Marketing'].map((cat) => (
                     <div 
                       key={cat} 
                       className="bg-background hover:bg-muted p-6 rounded-lg border text-center cursor-pointer transition-colors group"
                     >
                         <h3 className="font-semibold group-hover:text-primary transition-colors">{cat}</h3>
                     </div>
                 ))}
             </div>
         </div>
      </section>
      
      <Footer />
    </div>
  )
}
