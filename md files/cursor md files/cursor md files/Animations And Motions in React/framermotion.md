<framer_motion_installation>
  <instructions>
    <title>How to Integrate Framer Motion into Your Next.js Project</title>
    <description>Enhance your Next.js application with Framer Motion to create smooth and interactive animations.</description>
    <steps>
      <step>
        <number>1</number>
        <description>Install Framer Motion</description>
        <action>
          <command>npm install framer-motion</command>
        </action>
        <details>
          <item>Installs the Framer Motion library via npm.</item>
          <item>Adds it to your project's dependencies.</item>
        </details>
      </step>
      <step>
        <number>2</number>
        <description>Import Framer Motion in Your Component</description>
        <action>
          <code>import { motion } from 'framer-motion';</code>
        </action>
        <details>
          <item>Provides access to Framer Motion's animation components.</item>
        </details>
      </step>
      <step>
        <number>3</number>
        <description>Implement a Basic Animation</description>
        <action>
          <code>
            import { motion } from 'framer-motion';

            const MyComponent = () => {
              return (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1 }}
                >
                  <p>Welcome to Framer Motion!</p>
                </motion.div>
              );
            };

            export default MyComponent;
          </code>
        </action>
        <details>
          <item>Uses the `motion.div` component to create an animated `div`.</item>
          <item>Fades in the content from 0% to 100% opacity over one second.</item>
        </details>
      </step>
      <step>
        <number>4</number>
        <description>Start the Development Server</description>
        <action>
          <command>npm run dev</command>
        </action>
        <details>
          <item>Runs your Next.js project locally.</item>
          <item>Allows you to view the implemented animations in action.</item>
        </details>
      </step>
    </steps>
  </instructions>

  <execution>
    <prompt>Follow the above steps to integrate Framer Motion into your Next.js application and start creating engaging animations.</prompt>
  </execution>
</framer_motion_installation>
