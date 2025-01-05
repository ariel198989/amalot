import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AgentAgreements from "./AgentAgreements/AgentAgreementsComponent";
import AgentSettings from "./AgentSettings";

export default function Settings() {
  return (
    <div className="container mx-auto p-6">
      <Tabs defaultValue="general" className="w-full">
        <TabsList>
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