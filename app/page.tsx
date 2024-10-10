"use client";

import { useState, useEffect } from "react"
import { MemoryClient } from "mem0ai";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Search, Settings } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Memory {
  id: string;
  memory: string;
  user_id: string;
  hash: string;
  metadata: null;
  categories: string[];
  created_at: string;
  updated_at: string;
  custom_categories: string[] | null;
}

export default function MemoryDashboard() {
  const [apiKey, setApiKey] = useState<string>("")
  const [userId, setUserId] = useState<string>("")
  const [memories, setMemories] = useState<Memory[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>("")

  useEffect(() => {
    const savedApiKey = localStorage.getItem("memoryApiKey")
    const savedUserId = localStorage.getItem("memoryUserId")
    if (savedApiKey) setApiKey(savedApiKey)
    if (savedUserId) setUserId(savedUserId)
  }, [])

  const fetchMemories = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const client = new MemoryClient(apiKey);
      const fetchedMemories = await client.getAll({ user_id: userId });
      setMemories(fetchedMemories);
      localStorage.setItem("memoryApiKey", apiKey)
      localStorage.setItem("memoryUserId", userId)
    } catch (err) {
      setError('Failed to fetch memories. Please check your API key and user ID.')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredMemories = memories.filter(memory => 
    memory.memory.toLowerCase().includes(searchTerm.toLowerCase()) ||
    memory.categories.some(category => category.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Memory Dashboard</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              API Settings
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>API Settings</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="apiKey" className="text-right">API Key</label>
                <Input
                  id="apiKey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="userId" className="text-right">User ID</label>
                <Input
                  id="userId"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex space-x-2 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search memories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button onClick={fetchMemories} disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Fetch Memories'}
        </Button>
      </div>

      {error && (
        <Card className="mb-6">
          <CardContent className="pt-6 text-destructive">{error}</CardContent>
        </Card>
      )}

      <Tabs defaultValue="timeline" className="mb-6">
        <TabsList>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>
        <TabsContent value="timeline">
          <ScrollArea className="h-[calc(100vh-300px)]">
            {filteredMemories.map((memory) => (
              <Card key={memory.id} className="mb-4">
                <CardHeader>
                  <CardTitle className="text-base font-normal">{memory.memory}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {memory.categories.map((category, index) => (
                      <Badge key={index} variant="secondary">{category}</Badge>
                    ))}
                    {memory.custom_categories?.map((category, index) => (
                      <Badge key={index} variant="outline">{category}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </ScrollArea>
        </TabsContent>
        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Categories view coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}