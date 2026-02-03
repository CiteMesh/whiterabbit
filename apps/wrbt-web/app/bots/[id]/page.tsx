"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Star,
  GitFork,
  Download,
  Clock,
  Share2,
  Flag,
  Play,
  Shield,
  ArrowLeft
} from "lucide-react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Link from "next/link";

// Mock bot data
const mockBot = {
  id: "1",
  name: "Amazon Price Tracker",
  description: "Monitors Amazon product pages for price changes and stock availability. Sends alerts via webhook when prices drop below your target threshold or when out-of-stock items become available again.",
  author: "scraper_king",
  stars: 1240,
  forks: 85,
  downloads: 5432,
  updatedAt: "2h ago",
  category: "E-commerce",
  tags: ["ecommerce", "monitoring", "alerting", "nodejs", "webhook"],
  verified: true,
  wikiContent: `# Amazon Price Tracker

## Overview
This bot monitors Amazon product pages for price changes and stock availability. It's designed to help you save money by alerting you when prices drop below your target threshold.

## Features
- **Price Monitoring**: Track multiple products simultaneously
- **Stock Alerts**: Get notified when out-of-stock items return
- **Webhook Integration**: Receive alerts via your preferred platform
- **Rate Limited**: Respects Amazon's robots.txt and rate limits

## How It Works
1. Configure product URLs and target prices
2. Bot checks prices every 30 minutes
3. Sends webhook when conditions are met
4. Logs all price changes for historical analysis`,
  config: {
    interval: 30,
    webhook_url: "https://hooks.example.com/alert",
    products: [
      {
        url: "https://amazon.com/dp/B0EXAMPLE",
        target_price: 29.99
      }
    ]
  },
  code: `const axios = require('axios');
const cheerio = require('cheerio');

async function checkPrice(productUrl, targetPrice) {
  try {
    const response = await axios.get(productUrl);
    const $ = cheerio.load(response.data);

    const price = parseFloat(
      $('#priceblock_ourprice').text().replace('$', '')
    );

    if (price <= targetPrice) {
      await sendWebhookAlert({
        product: productUrl,
        currentPrice: price,
        targetPrice: targetPrice
      });
    }

    return price;
  } catch (error) {
    console.error('Price check failed:', error);
  }
}

module.exports = { checkPrice };`
};

export default function BotDetailPage() {
  const params = useParams();
  const [activeTab, setActiveTab] = useState("wiki");

  return (
    <div className="min-h-screen bg-background">
      {/* Back Button */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/bots">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Bots
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="flex items-start gap-4 mb-4">
            <div className="h-20 w-20 rounded-lg bg-gradient-to-br from-primary/10 to-accent/20 flex items-center justify-center shrink-0">
              <span className="text-3xl font-bold">{mockBot.name[0]}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold">{mockBot.name}</h1>
                {mockBot.verified && (
                  <Badge className="bg-primary/10 text-primary border-primary/20">
                    <Shield className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground text-lg mb-3">
                {mockBot.description}
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  by <Avatar className="h-5 w-5">
                    <AvatarFallback className="text-xs">{mockBot.author[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{mockBot.author}</span>
                </div>
                <Separator orientation="vertical" className="h-4" />
                <Badge variant="secondary">{mockBot.category}</Badge>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 mb-4">
            <Button size="lg" className="gap-2">
              <Play className="h-4 w-4" />
              Run Bot
            </Button>
            <Button variant="outline" size="lg" className="gap-2">
              <Star className="h-4 w-4" />
              Star
            </Button>
            <Button variant="outline" size="lg" className="gap-2">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Button variant="ghost" size="lg" className="gap-2 ml-auto">
              <Flag className="h-4 w-4" />
              Report
            </Button>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {mockBot.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Main Content with Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
          {/* Tabs Section */}
          <div>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="wiki">Wiki</TabsTrigger>
                <TabsTrigger value="code">Code & Config</TabsTrigger>
                <TabsTrigger value="history">Version History</TabsTrigger>
                <TabsTrigger value="discussion">Discussion</TabsTrigger>
              </TabsList>

              <TabsContent value="wiki">
                <Card>
                  <CardContent className="pt-6 prose prose-sm max-w-none dark:prose-invert">
                    <div className="whitespace-pre-wrap">{mockBot.wikiContent}</div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="code">
                <Card className="mb-4">
                  <CardHeader>
                    <CardTitle className="text-lg">Configuration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SyntaxHighlighter language="json" style={vscDarkPlus} className="rounded-lg">
                      {JSON.stringify(mockBot.config, null, 2)}
                    </SyntaxHighlighter>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Source Code</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SyntaxHighlighter language="javascript" style={vscDarkPlus} className="rounded-lg">
                      {mockBot.code}
                    </SyntaxHighlighter>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history">
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                        <div className="flex-1">
                          <p className="font-medium">v2.1.0 - Latest</p>
                          <p className="text-sm text-muted-foreground">Added webhook retry logic</p>
                          <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="h-2 w-2 rounded-full bg-muted mt-2" />
                        <div className="flex-1">
                          <p className="font-medium">v2.0.0</p>
                          <p className="text-sm text-muted-foreground">Major refactor with TypeScript</p>
                          <p className="text-xs text-muted-foreground mt-1">3 days ago</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="discussion">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-muted-foreground text-center py-8">
                      No discussions yet. Be the first to start a conversation!
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>Stars</span>
                  </div>
                  <span className="font-semibold">{mockBot.stars}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <GitFork className="h-4 w-4" />
                    <span>Forks</span>
                  </div>
                  <span className="font-semibold">{mockBot.forks}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Download className="h-4 w-4" />
                    <span>Downloads</span>
                  </div>
                  <span className="font-semibold">{mockBot.downloads}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4" />
                    <span>Updated</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{mockBot.updatedAt}</span>
                </div>
              </CardContent>
            </Card>

            {/* Author Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Author</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>{mockBot.author[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{mockBot.author}</p>
                    <p className="text-xs text-muted-foreground">Bot Creator</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
