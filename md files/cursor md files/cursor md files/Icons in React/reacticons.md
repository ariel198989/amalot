<react_icons_integration>
  <instructions>
    <title>Integrating React Icons into Your Project</title>
    <description>Enhance your React application by incorporating popular icon sets using the React Icons library.</description>
    <steps>
      <step>
        <number>1</number>
        <description>Install React Icons</description>
        <action>
          <command>npm install react-icons --save</command>
        </action>
        <details>
          <item>Installs the React Icons package, providing access to a wide range of icon sets.</item>
        </details>
      </step>
      <step>
        <number>2</number>
        <description>Import Specific Icons</description>
        <action>
          <code>
            import { FaBeer } from 'react-icons/fa';
          </code>
        </action>
        <details>
          <item>Imports the desired icon component from the appropriate icon set. In this example, `FaBeer` is imported from Font Awesome.</item>
        </details>
      </step>
      <step>
        <number>3</number>
        <description>Use the Icon in Your Component</description>
        <action>
          <code>
            function App() {
              return (
                &lt;div&gt;
                  &lt;h3&gt;Let's go for a &lt;FaBeer /&gt;?&lt;/h3&gt;
                &lt;/div&gt;
              );
            }
          </code>
        </action>
        <details>
          <item>Incorporates the imported icon component (`FaBeer`) into your React component's JSX.</item>
        </details>
      </step>
      <step>
        <number>4</number>
        <description>Explore Available Icons</description>
        <details>
          <item>Visit the [React Icons Documentation](https://react-icons.github.io/react-icons/) to browse and search for available icons across various icon sets.</item>
        </details>
      </step>
      <step>
        <number>5</number>
        <description>Optimize Icon Imports</description>
        <details>
          <item>For larger projects, consider importing icons directly from their respective packages to optimize bundle size:</item>
          <code>
            import { FaBeer } from '@react-icons/all-files/fa/FaBeer';
          </code>
          <item>This approach ensures that only the icons you use are included in your bundle.</item>
        </details>
      </step>
    </steps>
  </instructions>

  <execution>
    <prompt>Follow these steps to integrate React Icons into your React project. For more details, refer to the [React Icons Documentation](https://react-icons.github.io/react-icons/).</prompt>
  </execution>
</react_icons_integration>
