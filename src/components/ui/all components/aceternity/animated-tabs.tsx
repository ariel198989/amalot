"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Tab {
  title: string | React.ReactNode;
  value: string;
  content: React.ReactNode;
}

export const AnimatedTabs = ({
  tabs,
  containerClassName,
}: {
  tabs: Tab[];
  containerClassName?: string;
}) => {
  const [activeTab, setActiveTab] = useState<string>(tabs[0].value);

  return (
    <div className={cn("flex flex-col w-full", containerClassName)}>
      <div className="flex flex-row items-center justify-center mb-8">
        <div className="flex flex-row items-center justify-center p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "relative px-4 py-2 rounded-md text-sm font-medium transition-all duration-300",
                activeTab === tab.value
                  ? "text-white"
                  : "hover:text-blue-600 dark:hover:text-blue-400"
              )}
            >
              {activeTab === tab.value && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-md"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{tab.title}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl">
        {tabs.map((tab) => (
          <motion.div
            key={tab.value}
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: activeTab === tab.value ? 1 : 0,
              y: activeTab === tab.value ? 0 : 20,
            }}
            transition={{ duration: 0.3 }}
            className={cn(
              "absolute top-0 left-0 w-full",
              activeTab === tab.value ? "relative" : "hidden"
            )}
          >
            {tab.content}
          </motion.div>
        ))}
      </div>
    </div>
  );
}; 