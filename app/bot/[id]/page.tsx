"use client"

import { useState } from 'react'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Play, Star, Share2, Flag, Download, GitFork, Clock, CheckCircle2, Copy, BookOpen, Code, History, MessageSquare } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

export default function BotDetailPage({ params }: { params: { id: string } }) {
  const [searchQuery, setSearchQuery] = useState('')
  
  // Mock data - will be fetched from API using params.id
  const bot = {
    id: params.id,
    name: 'Instagram Scraper Pro',
    description: 'Advanced Instagram data extraction tool with support for posts, stories, and user profiles. Handles rate limiting and proxies automatically.',
    author: 'datascraper',
    stars: 1234,
    forks: 234,
    downloads: 5678,
    updatedAt: '2 days ago',
    category: 'Social Media',
    tags: ['instagram', 'scraping', 'social-media', 'data-extraction', 'api', 'python'],
    verified: true,
    image: '/api/placeholder/800/400',
  }

  const handleNavigate = (page: string) => {
    console.log('[v0] Navigate to:', page)
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    console.log('[v0] Code copied to clipboard')
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery}
        onNavigate={handleNavigate}
        currentPage="browse"
      />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Back Link */}
        <Button variant="ghost" className="mb-6 -ml-4" onClick={() => window.history.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Browse
        </Button>

        {/* Header */}
        <div className="grid md:grid-cols-[1fr_2fr] gap-8 mb-8">
          <div className="aspect-video rounded-lg border bg-muted overflow-hidden">
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <Code className="h-16 w-16" />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <h1 className="text-3xl font-bold tracking-tight flex-1">{bot.name}</h1>
              {bot.verified && (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Verified
                </Badge>
              )}
            </div>
            
            <p className="text-muted-foreground text-lg leading-relaxed">{bot.description}</p>
            
            <div className="flex flex-wrap gap-3 pt-2">
              <Button size="lg">
                <Play className="mr-2 h-4 w-4" />
                Run Bot
              </Button>
              <Button variant="outline" size="lg">
                <Star className="mr-2 h-4 w-4" />
                Star
              </Button>
              <Button variant="outline" size="lg">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
              <Button variant="ghost" size="icon">
                <Flag className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-[2fr_1fr] gap-8">
          {/* Main Content */}
          <div>
            <Tabs defaultValue="wiki" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="wiki" className="gap-2">
                  <BookOpen className="h-4 w-4" />
                  Wiki
                </TabsTrigger>
                <TabsTrigger value="code" className="gap-2">
                  <Code className="h-4 w-4" />
                  Code & Config
                </TabsTrigger>
                <TabsTrigger value="history" className="gap-2">
                  <History className="h-4 w-4" />
                  History
                </TabsTrigger>
                <TabsTrigger value="discussion" className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Discussion
                </TabsTrigger>
              </TabsList>

              <TabsContent value="wiki" className="space-y-6">
                <Card>
                  <CardContent className="prose dark:prose-invert max-w-none pt-6">
                    <h2>Overview</h2>
                    <p>
                      Instagram Scraper Pro is a powerful automation tool designed to extract data from Instagram profiles, posts, stories, and more. Built with reliability and efficiency in mind, it handles rate limiting automatically and supports proxy rotation for large-scale operations.
                    </p>
                    
                    <h3>Features</h3>
                    <ul>
                      <li>Extract user profiles, posts, and stories</li>
                      <li>Automatic rate limiting and retry logic</li>
                      <li>Proxy rotation support</li>
                      <li>Export data to JSON, CSV, or database</li>
                      <li>Configurable scraping parameters</li>
                    </ul>

                    <h3>Requirements</h3>
                    <ul>
                      <li>Python 3.8 or higher</li>
                      <li>Valid Instagram credentials (optional for public data)</li>
                      <li>Proxy list (optional but recommended)</li>
                    </ul>

                    <h3>Usage</h3>
                    <p>
                      See the Code & Config tab for detailed implementation examples and configuration options.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="code" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Configuration (JSON)</CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => handleCopyCode(configCode)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                      <code className="text-sm font-mono">{configCode}</code>
                    </pre>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Example Code (JavaScript)</CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => handleCopyCode(exampleCode)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                      <code className="text-sm font-mono">{exampleCode}</code>
                    </pre>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    {versionHistory.map((version, idx) => (
                      <div key={idx}>
                        {idx > 0 && <Separator className="my-4" />}
                        <div className="flex items-start gap-4">
                          <Badge variant={version.type === 'core' ? 'default' : 'secondary'}>
                            {version.type}
                          </Badge>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold">{version.version}</h4>
                              <span className="text-sm text-muted-foreground">{version.date}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{version.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="discussion" className="space-y-4">
                <Card>
                  <CardContent className="pt-6 text-center py-12">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No discussions yet</h3>
                    <p className="text-muted-foreground mb-4">Be the first to start a topic!</p>
                    <Button>Start Discussion</Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Download className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-semibold">{bot.downloads.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Installs</div>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <Star className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-semibold">{bot.stars.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Stars</div>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <GitFork className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-semibold">{bot.forks.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Forks</div>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-semibold">{bot.updatedAt}</div>
                    <div className="text-sm text-muted-foreground">Updated</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {bot.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Having issues or questions about this bot?
                </p>
                <Button className="w-full">Get Support</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

const configCode = `{
  "username": "your_instagram_username",
  "password": "your_password",
  "targets": ["profile1", "profile2"],
  "scrape_posts": true,
  "scrape_stories": true,
  "max_posts": 100,
  "use_proxy": true,
  "proxy_list": "proxies.txt",
  "output_format": "json"
}`

const exampleCode = `const InstagramScraper = require('./instagram-scraper');

const scraper = new InstagramScraper({
  username: process.env.IG_USERNAME,
  password: process.env.IG_PASSWORD
});

async function run() {
  await scraper.login();
  const data = await scraper.scrapeProfile('targetuser');
  console.log(data);
}

run();`

const versionHistory = [
  {
    version: 'v2.1.0',
    type: 'core',
    date: '2 days ago',
    description: 'Added support for Instagram Reels scraping and improved rate limiting algorithm'
  },
  {
    version: 'v2.0.5',
    type: 'bugfix',
    date: '1 week ago',
    description: 'Fixed issue with story extraction timing out on large accounts'
  },
  {
    version: 'v2.0.0',
    type: 'core',
    date: '2 weeks ago',
    description: 'Major rewrite with TypeScript support and improved error handling'
  }
]
