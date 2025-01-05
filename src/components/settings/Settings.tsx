import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AgentAgreements from "./AgentAgreements/AgentAgreementsComponent";
import AgentSettings from "./AgentSettings";

export default function Settings() {
  return (
    <div className="container mx-auto p-6">
      <Tabs defaultValue="general" dir="rtl">
        <TabsList className="mb-4">
          <TabsTrigger value="general">הגדרות כלליות</TabsTrigger>
          <TabsTrigger value="agreements">הסכמי סוכן</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <AgentSettings />
        </TabsContent>
        
        <TabsContent value="agreements">
          <AgentAgreements />
        </TabsContent>
      </Tabs>
    </div>
  );
} 