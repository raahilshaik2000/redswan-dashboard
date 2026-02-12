"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ProfileTab } from "./profile-tab";
import { SecurityTab } from "./security-tab";

export function SettingsContent() {
  return (
    <Tabs defaultValue="profile">
      <TabsList>
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
      </TabsList>
      <TabsContent value="profile" className="mt-6">
        <ProfileTab />
      </TabsContent>
      <TabsContent value="security" className="mt-6">
        <SecurityTab />
      </TabsContent>
    </Tabs>
  );
}
