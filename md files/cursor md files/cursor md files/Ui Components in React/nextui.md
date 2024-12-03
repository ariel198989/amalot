<nextui_integration>
  <instructions>
    <title>Integrating NextUI into Your React Project</title>
    <description>Enhance your React application with NextUI, a complete UI library for building accessible and customizable interfaces with Tailwind CSS and React Aria.</description>
    <steps>
      <step>
        <number>1</number>
        <description>Install NextUI and Dependencies</description>
        <action>
          <command>npm install @nextui-org/react framer-motion</command>
        </action>
        <details>
          <item>Installs the NextUI package and Framer Motion for animations.</item>
        </details>
      </step>
      <step>
        <number>2</number>
        <description>Set Up Tailwind CSS</description>
        <details>
          <item>Install and configure Tailwind CSS if not already set up. Follow the [official Tailwind CSS guide](https://tailwindcss.com/docs/installation).</item>
          <item>Add NextUI styles to your `tailwind.config.js` file:</item>
          <code>
            const { nextui } = require("@nextui-org/react");

            module.exports = {
              content: [
                "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
              ],
              theme: {
                extend: {},
              },
              darkMode: "class",
              plugins: [nextui()],
            };
          </code>
        </details>
      </step>
      <step>
        <number>3</number>
        <description>Wrap Your Application with NextUIProvider</description>
        <action>
          <code>
            import { NextUIProvider } from "@nextui-org/react";

            function App({ Component, pageProps }) {
              return (
                <NextUIProvider>
                  <Component {...pageProps} />
                </NextUIProvider>
              );
            }

            export default App;
          </code>
        </action>
        <details>
          <item>Adds the NextUIProvider component to wrap your application.</item>
          <item>Ensures all NextUI components function correctly.</item>
        </details>
      </step>
      <step>
        <number>4</number>
        <description>Use NextUI Components</description>
        <action>
          <code>
            import { Button } from "@nextui-org/react";

            function MyComponent() {
              return <Button>Click Me</Button>;
            }

            export default MyComponent;
          </code>
        </action>
        <details>
          <item>Imports and uses NextUI components like `Button`.</item>
          <item>Supports Tailwind CSS classes for styling customizations.</item>
        </details>
      </step>
      <step>
        <number>5</number>
        <description>Explore More Components</description>
        <details>
          <item>Visit the [NextUI Documentation](https://nextui.org/docs) to explore all available components and features.</item>
          <item>Utilize the CLI to add components directly to your project:</item>
          <command>nextui add button</command>
        </details>
      </step>
    </steps>
  </instructions>

  <execution>
    <prompt>Follow these steps to integrate and customize NextUI in your React application. For more details, refer to the [NextUI Documentation](https://nextui.org/docs/guide/introduction).</prompt>
  </execution>
</nextui_integration>
