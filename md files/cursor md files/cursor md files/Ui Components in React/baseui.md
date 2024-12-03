<base_ui_integration>
  <instructions>
    <title>Integrating Base UI into Your React Project</title>
    <description>Enhance your React application with Base UI, a library of headless ("unstyled") React components and low-level hooks, providing complete control over your app's CSS and accessibility features.</description>
    <steps>
      <step>
        <number>1</number>
        <description>Install Base UI</description>
        <action>
          <command>npm install @mui/base</command>
        </action>
        <details>
          <item>Installs the Base UI package into your project.</item>
        </details>
      </step>
      <step>
        <number>2</number>
        <description>Ensure Peer Dependencies are Installed</description>
        <details>
          <item>Verify that `react` and `react-dom` are installed in your project, as they are peer dependencies of Base UI.</item>
          <item>If not installed, add them using:</item>
          <action>
            <command>npm install react react-dom</command>
          </action>
        </details>
      </step>
      <step>
        <number>3</number>
        <description>Import and Use a Base UI Component</description>
        <action>
          <code>
            import * as React from 'react';
            import { Button } from '@mui/base/Button';

            function App() {
              return &lt;Button&gt;Click Me&lt;/Button&gt;;
            }

            export default App;
          </code>
        </action>
        <details>
          <item>Imports the `Button` component from Base UI.</item>
          <item>Utilizes the `Button` component in your React component.</item>
        </details>
      </step>
      <step>
        <number>4</number>
        <description>Style the Component</description>
        <details>
          <item>Base UI components are unstyled by default, allowing you to apply your own styles.</item>
          <item>You can use any styling method of your choice, such as CSS, Tailwind CSS, or MUI System.</item>
          <item>For example, using plain CSS:</item>
          <action>
            <code>
              /* styles.css */
              .btn {
                background-color: #1f883d;
                /* additional styles */
              }

              /* App.js */
              &lt;Button className="btn"&gt;Create Repository&lt;/Button&gt;
            </code>
          </action>
        </details>
      </step>
      <step>
        <number>5</number>
        <description>Explore Additional Components and Hooks</description>
        <details>
          <item>Base UI provides a variety of components and hooks to build accessible and customizable UI elements.</item>
          <item>Refer to the [Base UI Documentation](https://mui.com/base-ui/getting-started/quickstart/) for detailed information and examples.</item>
        </details>
      </step>
    </steps>
  </instructions>

  <execution>
    <prompt>Follow these steps to integrate Base UI into your React project. For more details, refer to the [Base UI Quickstart Guide](https://mui.com/base-ui/getting-started/quickstart/).</prompt>
  </execution>
</base_ui_integration>
