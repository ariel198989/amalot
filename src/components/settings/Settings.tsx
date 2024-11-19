import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AgentAgreements from './AgentAgreements';
import { Settings as SettingsIcon, User, FileText } from 'lucide-react';

const Settings: React.FC = () => {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center gap-4 mb-8">
        <SettingsIcon className="h-8 w-8 text-gray-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">הגדרות מערכת</h1>
          <p className="text-gray-500">ניהול הגדרות והסכמי סוכן</p>
        </div>
      </div>

      <Tabs defaultValue="agreements" className="space-y-6">
        <TabsList className="bg-white p-1 border rounded-lg">
          <TabsTrigger value="agreements" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            הסכמי סוכן
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            פרטי משתמש
          </TabsTrigger>
        </TabsList>

        <TabsContent value="agreements">
          <AgentAgreements />
        </TabsContent>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>פרטי משתמש</CardTitle>
            </CardHeader>
            <CardContent>
              <p>כאן יופיעו פרטי המשתמש והגדרות נוספות...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings; 