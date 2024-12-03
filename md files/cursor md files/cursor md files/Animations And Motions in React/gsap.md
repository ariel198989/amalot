<gsap_installation>
  <instructions>
    <title>How to Install and Use GSAP in a Next.js Project</title>
    <description>Integrate GSAP (GreenSock Animation Platform) into your Next.js application to add animations effortlessly.</description>
    <steps>
      <step>
        <number>1</number>
        <description>Install GSAP</description>
        <action>
          <command>npm install gsap</command>
        </action>
        <details>
          <item>Installs the GSAP library via npm.</item>
          <item>Ensures it is added to your project's dependencies.</item>
        </details>
      </step>
      <step>
        <number>2</number>
        <description>Import GSAP in Your Component</description>
        <action>
          <code>import { gsap } from 'gsap';</code>
        </action>
        <details>
          <item>Allows access to GSAP animation methods within your component.</item>
        </details>
      </step>
      <step>
        <number>3</number>
        <description>Implement Basic GSAP Animation</description>
        <action>
          <code>
            import { useEffect, useRef } from 'react';
            import { gsap } from 'gsap';

            const MyComponent = () => {
              const elementRef = useRef(null);

              useEffect(() => {
                gsap.to(elementRef.current, { x: 100, duration: 1 });
              }, []);

              return <div ref={elementRef}>Animate me!</div>;
            };

            export default MyComponent;
          </code>
        </action>
        <details>
          <item>Defines a `ref` for the target element.</item>
          <item>Animates the element to move 100 pixels right over one second on mount.</item>
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
          <item>Ensures the GSAP integration works as expected.</item>
        </details>
      </step>
    </steps>
  </instructions>

  <execution>
    <prompt>Follow the above steps to set up and start using GSAP in your Next.js application.</prompt>
  </execution>
</gsap_installation>
