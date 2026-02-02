'use client'

import { Bot, MessageSquare, Workflow, Globe, Database, Zap, ChevronRight } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

interface NavSection {
  title: string
  icon: React.ReactNode
  items: string[]
}

const navSections: NavSection[] = [
  {
    title: 'Bot Types',
    icon: <Bot className="h-4 w-4" />,
    items: ['Chat Bots', 'Task Automation', 'Data Processing', 'Content Generation', 'Customer Support']
  },
  {
    title: 'Platforms',
    icon: <Globe className="h-4 w-4" />,
    items: ['WhatsApp', 'Telegram', 'Discord', 'Slack', 'Microsoft Teams']
  },
  {
    title: 'Capabilities',
    icon: <Zap className="h-4 w-4" />,
    items: ['Natural Language', 'Image Generation', 'Voice', 'Multi-Agent', 'Memory']
  },
  {
    title: 'Integrations',
    icon: <Database className="h-4 w-4" />,
    items: ['OpenAI', 'Anthropic', 'OpenRouter', 'Custom APIs', 'Database Tools']
  },
  {
    title: 'Use Cases',
    icon: <Workflow className="h-4 w-4" />,
    items: ['Education', 'Healthcare', 'Finance', 'E-commerce', 'Development']
  }
]

export function BotSidebar() {
  const [openSections, setOpenSections] = useState<string[]>(['Bot Types'])

  const toggleSection = (title: string) => {
    setOpenSections(prev =>
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    )
  }

  return (
    <ScrollArea className="h-full py-6 px-3">
      <div className="space-y-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Browse Bots
          </h2>
          <div className="space-y-1">
            {navSections.map((section) => (
              <Collapsible
                key={section.title}
                open={openSections.includes(section.title)}
                onOpenChange={() => toggleSection(section.title)}
              >
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start gap-2 px-4">
                    {section.icon}
                    <span className="flex-1 text-left">{section.title}</span>
                    <ChevronRight
                      className={`h-4 w-4 transition-transform ${
                        openSections.includes(section.title) ? 'rotate-90' : ''
                      }`}
                    />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="ml-6 space-y-1">
                  {section.items.map((item) => (
                    <Button
                      key={item}
                      variant="ghost"
                      className="w-full justify-start px-4 text-sm text-muted-foreground hover:text-foreground"
                    >
                      {item}
                    </Button>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </div>
        
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-sm font-semibold tracking-tight text-muted-foreground">
            Community
          </h2>
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start px-4">
              Recent Changes
            </Button>
            <Button variant="ghost" className="w-full justify-start px-4">
              Featured Bots
            </Button>
            <Button variant="ghost" className="w-full justify-start px-4">
              Contributors
            </Button>
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}
