// frontend/src/pages/AiGiftFinderPage.jsx
import React from "react";
import { Sparkles, LayoutGrid, MessageSquare } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import GiftChatInterface from "../components/ai/GiftChatInterface";
import AiGiftFinder from "../components/ai/AiGiftFinder"; // The Tap-Picker we built earlier

export default function AiGiftFinderPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12 min-h-[80vh]">
      {/* Premium Header */}
      <div className="text-center max-w-2xl mx-auto mb-10 space-y-4">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-2">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          Prizzy{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
            AI Advisor
          </span>
        </h1>
        <p className="text-lg text-muted-foreground">
          Not sure what to buy? Let our intelligent assistant find the perfect
          gift based on your exact needs.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <Tabs defaultValue="guided" className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="grid w-full max-w-md grid-cols-2 p-1 bg-muted/50 rounded-xl">
              <TabsTrigger
                value="guided"
                className="rounded-lg gap-2 data-[state=active]:shadow-sm"
              >
                <LayoutGrid className="w-4 h-4" />
                Quick Filter
              </TabsTrigger>
              <TabsTrigger
                value="chat"
                className="rounded-lg gap-2 data-[state=active]:shadow-sm"
              >
                <MessageSquare className="w-4 h-4" />
                Chat Advisor
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="bg-card/50 backdrop-blur-sm border rounded-2xl p-4 md:p-8 shadow-sm">
            <TabsContent
              value="guided"
              className="m-0 focus-visible:outline-none focus-visible:ring-0"
            >
              <AiGiftFinder />
            </TabsContent>

            <TabsContent
              value="chat"
              className="m-0 focus-visible:outline-none focus-visible:ring-0"
            >
              <GiftChatInterface />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
