import React from 'react';
import { Bot } from './BotCard';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Star, 
  GitFork, 
  Download, 
  Clock, 
  Share2, 
  Flag, 
  Play, 
  Code, 
  BookOpen, 
  History,
  MessageSquare,
  CheckCircle2
} from "lucide-react";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface BotDetailProps {
  bot: Bot;
  onBack: () => void;
}

export function BotDetail({ bot, onBack }: BotDetailProps) {
  const jsonConfig = `{
  "bot_id": "${bot.id}",
  "version": "1.0.2",
  "settings": {
    "concurrency": 5,
    "timeout": 30000,
    "user_agent_rotate": true,
    "proxies": []
  },
  "targets": [
    "https://example.com/products",
    "https://example.com/categories"
  ]
}`;

  const jsCode = `import { OpenClaw } from '@openclaw/core';

export default async function run(ctx) {
  const { page } = ctx;
  await page.goto('https://example.com');
  const title = await page.title();
  return { title };
}`;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl animate-in fade-in duration-500">
      <Button variant="ghost" onClick={onBack} className="mb-4 pl-0 hover:pl-2 transition-all">
        ← Back to Browse
      </Button>

      {/* Header Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
            <div className="flex flex-col md:flex-row gap-6 mb-6">
                <div className="h-32 w-32 rounded-xl overflow-hidden shadow-lg shrink-0 bg-muted">
                    <ImageWithFallback src={bot.image} alt={bot.name} className="h-full w-full object-cover" />
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <h1 className="text-3xl font-bold tracking-tight">{bot.name}</h1>
                        <Badge variant="outline" className="border-green-500/50 text-green-600 bg-green-500/10">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Verified
                        </Badge>
                    </div>
                    <p className="text-lg text-muted-foreground mb-4 max-w-2xl">
                        {bot.description}
                    </p>
                    
                    <div className="flex items-center gap-3">
                        <Button className="gap-2">
                            <Play className="w-4 h-4" /> Run Bot
                        </Button>
                        <Button variant="outline" className="gap-2">
                            <Star className="w-4 h-4" /> Star
                        </Button>
                         <Button variant="ghost" size="icon">
                            <Share2 className="w-4 h-4" />
                        </Button>
                         <Button variant="ghost" size="icon">
                            <Flag className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="wiki" className="w-full">
                <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-6">
                    <TabsTrigger value="wiki" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 py-3">
                        <BookOpen className="w-4 h-4 mr-2" /> Wiki
                    </TabsTrigger>
                    <TabsTrigger value="code" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 py-3">
                        <Code className="w-4 h-4 mr-2" /> Code & Config
                    </TabsTrigger>
                    <TabsTrigger value="history" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 py-3">
                        <History className="w-4 h-4 mr-2" /> Version History
                    </TabsTrigger>
                    <TabsTrigger value="discussion" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 py-3">
                        <MessageSquare className="w-4 h-4 mr-2" /> Discussion
                    </TabsTrigger>
                </TabsList>
                
                <TabsContent value="wiki" className="pt-6">
                    <div className="prose prose-slate dark:prose-invert max-w-none">
                        <h3>About this Bot</h3>
                        <p>
                            This is a user-contributed bot designed for the OpenClaw platform. It leverages advanced scraping techniques to gather data efficiently.
                            Contributions are welcome! Please check the contribution guidelines before submitting edits to this page.
                        </p>
                        
                        <h4>Features</h4>
                        <ul>
                            <li>High-performance data extraction</li>
                            <li>Built-in proxy rotation support</li>
                            <li>Automatic retries on failure</li>
                            <li>JSON and CSV export formats</li>
                        </ul>

                        <h4>Usage Guide</h4>
                        <p>
                            To use this bot, configure your target URLs in the configuration tab. The bot respects `robots.txt` by default but can be configured otherwise if authorized.
                        </p>
                        
                        <div className="bg-muted p-4 rounded-lg my-4 border">
                            <p className="font-mono text-sm text-muted-foreground">
                                // Example command line usage<br/>
                                openclaw run {bot.id} --output=data.json
                            </p>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="code" className="pt-6">
                   <div className="flex flex-col gap-8">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-lg font-semibold">Configuration (JSON)</h3>
                                <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(jsonConfig)}>Copy Config</Button>
                            </div>
                            <div className="rounded-lg overflow-hidden border">
                                <SyntaxHighlighter language="json" style={vscDarkPlus} showLineNumbers customStyle={{ margin: 0 }}>
                                    {jsonConfig}
                                </SyntaxHighlighter>
                            </div>
                        </div>
                        
                        <div>
                             <div className="flex justify-between items-center mb-2">
                                 <h3 className="text-lg font-semibold">Source Snippet (JavaScript)</h3>
                                 <Button variant="outline" size="sm">View Repo</Button>
                             </div>
                             <div className="rounded-lg overflow-hidden border">
                                <SyntaxHighlighter language="javascript" style={vscDarkPlus} showLineNumbers customStyle={{ margin: 0 }}>
                                    {jsCode}
                                </SyntaxHighlighter>
                            </div>
                        </div>
                   </div>
                </TabsContent>

                <TabsContent value="history" className="pt-6">
                    <div className="space-y-4">
                        {[1,2,3].map((i) => (
                            <div key={i} className="flex gap-4 items-start border-l-2 pl-4 pb-4">
                                <div className="flex flex-col gap-1">
                                    <span className="font-semibold">v1.0.{4-i}</span>
                                    <span className="text-xs text-muted-foreground">Updated 2 days ago</span>
                                </div>
                                <div>
                                    <p className="text-sm">Fixed minor bugs in selector logic for dynamic pages.</p>
                                    <div className="flex gap-2 mt-2">
                                        <Badge variant="secondary" className="text-xs font-normal">bugfix</Badge>
                                        <Badge variant="secondary" className="text-xs font-normal">core</Badge>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </TabsContent>
                
                <TabsContent value="discussion" className="pt-6">
                    <div className="text-center py-10 text-muted-foreground">
                        <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>No discussions yet. Be the first to start a topic!</p>
                        <Button variant="outline" className="mt-4">Start Discussion</Button>
                    </div>
                </TabsContent>
            </Tabs>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Bot Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center text-sm text-muted-foreground">
                            <Download className="w-4 h-4 mr-2" /> Installs
                        </div>
                        <span className="font-semibold">{bot.downloads.toLocaleString()}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                        <div className="flex items-center text-sm text-muted-foreground">
                            <Star className="w-4 h-4 mr-2" /> Stars
                        </div>
                        <span className="font-semibold">{bot.stars.toLocaleString()}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                        <div className="flex items-center text-sm text-muted-foreground">
                            <GitFork className="w-4 h-4 mr-2" /> Forks
                        </div>
                        <span className="font-semibold">{bot.forks.toLocaleString()}</span>
                    </div>
                    <Separator />
                     <div className="flex justify-between items-center">
                        <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="w-4 h-4 mr-2" /> Last Update
                        </div>
                        <span className="font-semibold">{bot.updatedAt}</span>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Author</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarImage src={`https://github.com/${bot.author}.png`} />
                            <AvatarFallback>{bot.author[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="font-semibold hover:underline cursor-pointer">{bot.author}</div>
                            <div className="text-xs text-muted-foreground">Top Contributor</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Tags</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {bot.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="cursor-pointer hover:bg-secondary/80">{tag}</Badge>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
