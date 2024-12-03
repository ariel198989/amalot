<motion_primitives_integration>
  <instructions>
    <title>Integrating Motion-Primitives into Your React Project</title>
    <description>Enhance your React application with Motion-Primitives, a collection of reusable animated components built with Framer Motion and Tailwind CSS.</description>
    <steps>
      <step>
        <number>1</number>
        <description>Install Tailwind CSS</description>
        <details>
          <item>Follow the official Tailwind CSS installation guide to add it to your project.</item>
        </details>
      </step>
      <step>
        <number>2</number>
        <description>Install Framer Motion</description>
        <action>
          <command>npm install framer-motion</command>
        </action>
        <details>
          <item>Installs Framer Motion, a library for animations in React.</item>
        </details>
      </step>
      <step>
        <number>3</number>
        <description>Install Motion-Primitives</description>
        <action>
          <command>npm install motion-primitives</command>
        </action>
        <details>
          <item>Installs Motion-Primitives, a collection of animated components.</item>
        </details>
      </step>
      <step>
        <number>4</number>
        <description>Import and Use a Component</description>
        <action>
          <code>
            import { AnimatedGroup } from 'motion-primitives';

            const App = () => {
              return (
                &lt;AnimatedGroup&gt;
                  &lt;div&gt;Item 1&lt;/div&gt;
                  &lt;div&gt;Item 2&lt;/div&gt;
                  &lt;div&gt;Item 3&lt;/div&gt;
                &lt;/AnimatedGroup&gt;
              );
            };

            export default App;
          </code>
        </action>
        <details>
          <item>Imports the `AnimatedGroup` component from Motion-Primitives.</item>
          <item>Wraps child elements with `AnimatedGroup` to apply animations.</item>
        </details>
      </step>
      <step>
        <number>5</number>
        <description>Customize Components as Needed</description>
        <details>
          <item>Modify the components to fit your project's requirements.</item>
          <item>Utilize Tailwind CSS classes and Framer Motion props for customization.</item>
        </details>
      </step>
    </steps>
  </instructions>

  <execution>
    <prompt>Follow these steps to integrate and customize Motion-Primitives in your React application. For more details, refer to the [Motion-Primitives Documentation](https://motion-primitives.com/docs).</prompt>
  </execution>
</motion_primitives_integration>
