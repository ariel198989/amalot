<radix_icons_integration>
  <instructions>
    <title>Integrating Radix Icons into Your React Project</title>
    <description>Enhance your React application with Radix Icons, a crisp set of 15×15 icons designed by the WorkOS team.</description>
    <steps>
      <step>
        <number>1</number>
        <description>Install Radix Icons Package</description>
        <action>
          <command>npm install @radix-ui/react-icons</command>
        </action>
        <details>
          <item>Installs the Radix Icons package via npm.</item>
          <item>Adds it to your project's dependencies.</item>
        </details>
      </step>
      <step>
        <number>2</number>
        <description>Import and Use an Icon</description>
        <action>
          <code>
            import { FaceIcon } from '@radix-ui/react-icons';

            const App = () => {
              return <FaceIcon />;
            };

            export default App;
          </code>
        </action>
        <details>
          <item>Imports the `FaceIcon` component from Radix Icons.</item>
          <item>Renders the `FaceIcon` within your component.</item>
        </details>
      </step>
      <step>
        <number>3</number>
        <description>Customize Icon Properties</description>
        <action>
          <code>
            import { FaceIcon } from '@radix-ui/react-icons';

            const App = () => {
              return <FaceIcon style={{ width: 30, height: 30, color: 'blue' }} />;
            };

            export default App;
          </code>
        </action>
        <details>
          <item>Applies inline styles to adjust the icon's size and color.</item>
          <item>Sets the icon's width and height to 30 pixels and color to blue.</item>
        </details>
      </step>
      <step>
        <number>4</number>
        <description>Explore Available Icons</description>
        <details>
          <item>Radix Icons offers a variety of categories, including:</item>
          <sublist>
            <item>Typography</item>
            <item>Music</item>
            <item>Abstract</item>
            <item>Logos</item>
            <item>Arrows</item>
            <item>Objects</item>
            <item>Design</item>
            <item>Components</item>
            <item>Borders and Corners</item>
            <item>Alignment</item>
            <item>Assets</item>
          </sublist>
          <item>For a complete list and visual reference, visit the [Radix Icons Gallery](https://www.radix-ui.com/icons).</item>
        </details>
      </step>
      <step>
        <number>5</number>
        <description>Access Design Files</description>
        <details>
          <item>Radix Icons are available in various formats for design purposes:</item>
          <sublist>
            <item>[Open in Figma](https://www.figma.com/file/0X0X0X0X0X0X0X0X/Radix-Icons)</item>
            <item>[Download for Sketch](https://raw.githubusercontent.com/radix-ui/icons/master/Radix-Icons.sketch)</item>
            <item>[Download IconJar](https://raw.githubusercontent.com/radix-ui/icons/master/Radix-Icons.iconjar)</item>
            <item>[Download SVG](https://raw.githubusercontent.com/radix-ui/icons/master/Radix-Icons.zip)</item>
          </sublist>
          <item>These resources facilitate seamless integration into your design workflow.</item>
        </details>
      </step>
    </steps>
  </instructions>

  <execution>
    <prompt>Follow these steps to integrate and customize Radix Icons in your React application. For more details, refer to the [Radix Icons Documentation](https://www.radix-ui.com/icons).</prompt>
  </execution>
</radix_icons_integration>
