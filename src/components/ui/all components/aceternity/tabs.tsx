"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface Tab {
  title: string;
  value: string;
  content: JSX.Element;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  containerClassName?: string;
  activeTabClassName?: string;
  tabClassName?: string;
  contentClassName?: string;
}

export const Tabs = ({
  tabs,
  activeTab,
  onTabChange,
  containerClassName,
  activeTabClassName,
  tabClassName,
  contentClassName,
}: TabsProps) => {
  useEffect(() => {
    if (!activeTab && tabs.length > 0) {
      onTabChange(tabs[0].value);
    }
  }, []);

  const handleTabClick = (tab: string) => {
    onTabChange(tab);
  };

  return (
    <div className={cn("flex flex-col", containerClassName)}>
      <div className="flex flex-row items-center justify-start space-x-2">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleTabClick(tab.value)}
            className={cn(
              "relative px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              activeTab === tab.value
                ? "text-white"
                : "text-zinc-500 hover:text-zinc-200",
              tabClassName
            )}
          >
            {activeTab === tab.value && (
              <motion.div
                layoutId="active-pill"
                className={cn(
                  "absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-lg",
                  activeTabClassName
                )}
                transition={{ type: "spring", duration: 0.5 }}
              />
            )}
            <span className="relative z-10">{tab.title}</span>
          </button>
        ))}
      </div>
      <div className={cn("mt-4", contentClassName)}>
        {tabs.find((tab) => tab.value === activeTab)?.content}
      </div>
    </div>
  );
};
