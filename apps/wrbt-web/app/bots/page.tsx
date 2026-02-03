"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Star, GitFork, Download, Clock, Sparkles, Filter, TrendingUp, Users, Bell } from "lucide-react";
import { Navbar } from "@/components/navbar";

// Mock bot data
const mockBots = [
  {
    id: "1",
    name: "Amazon Price Tracker",
    description: "Monitors Amazon product pages for price changes and stock availability. Sends alerts via webhook.",
    author: "scraper_king",
    stars: 1240,
    forks: 85,
    downloads: 5432,
    updatedAt: "2h ago",
    category: "E-commerce",
    tags: ["ecommerce", "monitoring", "alerting", "nodejs"]
  },
  {
    id: "2",
    name: "LinkedIn Lead Gen",
    description: "Automates profile visiting and connection requests on LinkedIn. Compliant with rate limits.",
    author: "growth_hacker",
    stars: 890,
    forks: 120,
    downloads: 3210,
    updatedAt: "1d ago",
    category: "Social Media",
    tags: ["linkedin", "marketing", "automation"]
  },
  {
    id: "3",
    name: "Crypto Arbitrage Bot",
    description: "Scans multiple exchanges for price differences and executes trades automatically.",
    author: "satoshi_fan",
    stars: 2100,
    forks: 340,
    downloads: 8900,
    updatedAt: "5m ago",
    category: "Finance",
    tags: ["crypto", "finance", "trading", "high-frequency"]
  },
  {
    id: "4",
    name: "SEO Audit Spider",
    description: "Crawls websites to identify broken links, missing metadata, and performance issues.",
    author: "seo_wizard",
    stars: 567,
    forks: 78,
    downloads: 2340,
    updatedAt: "3h ago",
    category: "SEO",
    tags: ["seo", "audit", "crawler"]
  }
];

export default function BotsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState("browse");

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar
        onNavigate={setCurrentPage}
        currentPage={currentPage}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <div className="flex-1 flex">
        {/* Main Content - Left Side */}
        <main className="flex-1 p-8">
          {/* Hero Section */}
          <div className="mb-12">
            <Badge variant="secondary" className="mb-4">v2.0 Now Available</Badge>
            <h1 className="text-5xl font-bold mb-4">
              The Encyclopedia of Bots
            </h1>
            <p className="text-muted-foreground text-lg mb-6 max-w-2xl">
              Discover, share, and collaborate on automation scripts. The largest open-source database for OpenClaw bots.
            </p>

            {/* Search Bar */}
            <div className="flex gap-2 max-w-2xl mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search for bots, scrapers, automation..."
                  className="pl-10 h-11"
                />
              </div>
              <Button className="h-11">Search</Button>
            </div>

            {/* Popular searches */}
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="text-muted-foreground">Popular:</span>
              <button className="text-primary hover:underline">Instagram Scraper</button>
              <span className="text-muted-foreground">•</span>
              <button className="text-primary hover:underline">Crypto Trading</button>
              <span className="text-muted-foreground">•</span>
              <button className="text-primary hover:underline">SEO Audit</button>
            </div>
          </div>

          {/* Featured Bots Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                Featured Bots
              </h2>
              <div className="flex items-center gap-3">
                <Tabs defaultValue="all">
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

            {/* Bot Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockBots.map((bot) => (
                <Card key={bot.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                  <div className="relative h-40 w-full overflow-hidden bg-muted">
                    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/20">
                      <div className="text-6xl font-bold text-muted-foreground/20">{bot.name[0]}</div>
                    </div>
                    <Badge className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm">
                      {bot.category}
                    </Badge>
                  </div>
                  <CardHeader className="p-4">
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">{bot.name}</CardTitle>
                    <CardDescription className="text-xs">by {bot.author}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 flex-grow">
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {bot.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {bot.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 border-t bg-muted/20 flex justify-between text-xs text-muted-foreground">
                    <div className="flex gap-3">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        {bot.stars}
                      </div>
                      <div className="flex items-center gap-1">
                        <GitFork className="h-3 w-3" />
                        {bot.forks}
                      </div>
                      <div className="flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        {bot.downloads}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {bot.updatedAt}
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </main>

        {/* Sidebar - Right Side */}
        <aside className="w-80 border-l bg-muted/30 p-6 overflow-y-auto">
          {/* Welcome Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Welcome to OpenClaw Bot Wiki</CardTitle>
              <CardDescription>
                The comprehensive, community-driven database of AI agents and bots. Discover, learn about, and contribute to the growing ecosystem of intelligent automation.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Stats Dashboard */}
          <div className="grid grid-cols-1 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Bots</p>
                    <p className="text-2xl font-bold">1,247</p>
                    <p className="text-xs text-muted-foreground">+48 this month</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Contributors</p>
                    <p className="text-2xl font-bold">3,492</p>
                    <p className="text-xs text-muted-foreground">Active community</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-secondary/30 flex items-center justify-center">
                    <Users className="h-6 w-6 text-secondary-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Updates Today</p>
                    <p className="text-2xl font-bold">127</p>
                    <p className="text-xs text-muted-foreground">Last updated 2min ago</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-accent/50 flex items-center justify-center">
                    <Bell className="h-6 w-6 text-accent-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Browse Bots */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-sm">Browse Bots</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between text-sm hover:text-primary cursor-pointer">
                <span>Chat Bots</span>
                <Badge variant="secondary">124</Badge>
              </div>
              <div className="flex items-center justify-between text-sm hover:text-primary cursor-pointer">
                <span>Task Automation</span>
                <Badge variant="secondary">89</Badge>
              </div>
              <div className="flex items-center justify-between text-sm hover:text-primary cursor-pointer">
                <span>Data Processing</span>
                <Badge variant="secondary">67</Badge>
              </div>
              <div className="flex items-center justify-between text-sm hover:text-primary cursor-pointer">
                <span>Content Generation</span>
                <Badge variant="secondary">53</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Featured Bots List */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm">Featured</CardTitle>
              <Badge variant="outline" className="text-xs">Trending</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockBots.slice(0, 3).map((bot) => (
                <div key={bot.id} className="space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded bg-gradient-to-br from-primary/10 to-accent/20 flex items-center justify-center shrink-0">
                      <span className="font-bold text-sm">{bot.name[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{bot.name}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{bot.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{bot.category}</Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Star className="h-3 w-3" />
                          {bot.stars}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
