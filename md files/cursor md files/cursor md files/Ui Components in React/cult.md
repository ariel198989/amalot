<cult_ui_integration>
  <instructions>
    <title>Integrating Cult Components into Your React Project</title>
    <description>Enhance your React application with Cult Components, designed with TypeScript, Tailwind CSS, and Framer Motion.</description>
    <steps>
      <step>
        <number>1</number>
        <description>Install Required Dependencies</description>
        <action>
          <command>npm install -D tailwindcss@latest clsx tailwind-merge framer-motion</command>
        </action>
        <details>
          <item>Installs the latest version of Tailwind CSS for styling.</item>
          <item>Includes `clsx` and `tailwind-merge` for class name management.</item>
          <item>Adds Framer Motion for animations.</item>
        </details>
      </step>
      <step>
        <number>2</number>
        <description>Set Up Utility Function for Class Name Merging</description>
        <action>
          <code>
            // lib/utils.ts
            import clsx, { ClassValue } from "clsx";
            import { twMerge } from "tailwind-merge";

            export function cn(...inputs: ClassValue[]) {
              return twMerge(clsx(inputs));
            }
          </code>
        </action>
        <details>
          <item>Creates a utility function `cn` to merge class names efficiently.</item>
          <item>Ensures consistent styling across components.</item>
        </details>
      </step>
      <step>
        <number>3</number>
        <description>Integrate Cult Components into Your Project</description>
        <details>
          <item>Visit the [Cult Components Documentation](https://www.cult-ui.com/docs) to explore available components.</item>
          <item>Select the desired component and copy its code.</item>
          <item>Paste the code into your project, ensuring all dependencies are imported correctly.</item>
        </details>
      </step>
      <step>
        <number>4</number>
        <description>Customize Components as Needed</description>
        <details>
          <item>Modify the components to fit your project's requirements.</item>
          <item>Utilize the `cn` utility function for class name management.</item>
        </details>
      </step>
    </steps>
  </instructions>

  <execution>
    <prompt>Follow these steps to integrate and customize Cult Components in your React application. For more details, refer to the [Cult Components Documentation](https://www.cult-ui.com/docs).</prompt>
  </execution>
</cult_ui_integration>
