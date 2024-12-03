<lucide_react_integration>
  <instructions>
    <title>Integrating Lucide Icons into Your React Project</title>
    <description>Enhance your React application with Lucide's beautiful and consistent icon library.</description>
    <steps>
      <step>
        <number>1</number>
        <description>Install Lucide React Package</description>
        <action>
          <command>npm install lucide-react</command>
        </action>
        <details>
          <item>Installs the Lucide React package via npm.</item>
          <item>Adds it to your project's dependencies.</item>
        </details>
      </step>
      <step>
        <number>2</number>
        <description>Import and Use an Icon</description>
        <action>
          <code>
            import { Camera } from 'lucide-react';

            const App = () => {
              return <Camera color="red" size={48} />;
            };

            export default App;
          </code>
        </action>
        <details>
          <item>Imports the `Camera` icon component from Lucide React.</item>
          <item>Renders the icon with a red color and size of 48 pixels.</item>
        </details>
      </step>
      <step>
        <number>3</number>
        <description>Customize Icon Properties</description>
        <action>
          <code>
            import { Camera } from 'lucide-react';

            const App = () => {
              return <Camera size={48} fill="red" />;
            };

            export default App;
          </code>
        </action>
        <details>
          <item>Utilizes SVG attributes to customize the icon's appearance.</item>
          <item>Sets the `fill` property to red and size to 48 pixels.</item>
        </details>
      </step>
      <step>
        <number>4</number>
        <description>Use Lucide Lab or Custom Icons</description>
        <action>
          <code>
            import { Icon } from 'lucide-react';
            import { burger } from '@lucide/lab';

            const App = () => (
              <Icon iconNode={burger} />
            );

            export default App;
          </code>
        </action>
        <details>
          <item>Imports the `Icon` component from Lucide React and a custom icon from Lucide Lab.</item>
          <item>Renders the custom `burger` icon using the `Icon` component.</item>
        </details>
      </step>
      <step>
        <number>5</number>
        <description>Implement Dynamic Icon Imports</description>
        <action>
          <code>
            import React, { lazy, Suspense } from 'react';
            import dynamicIconImports from 'lucide-react/dynamicIconImports';

            const fallback = <div style={{ background: '#ddd', width: 24, height: 24 }}/>;

            const Icon = ({ name, ...props }) => {
              const LucideIcon = lazy(dynamicIconImports[name]);

              return (
                <Suspense fallback={fallback}>
                  <LucideIcon {...props} />
                </Suspense>
              );
            };

            export default Icon;
          </code>
        </action>
        <details>
          <item>Utilizes React's `lazy` and `Suspense` for dynamic icon imports.</item>
          <item>Reduces initial bundle size by loading icons on demand.</item>
        </details>
      </step>
    </steps>
  </instructions>

  <execution>
    <prompt>Follow these steps to integrate and customize Lucide icons in your React application. For more details, refer to the [Lucide React Guide](https://lucide.dev/guide/packages/lucide-react).</prompt>
  </execution>
</lucide_react_integration>
