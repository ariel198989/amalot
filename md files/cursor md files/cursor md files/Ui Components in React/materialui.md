<material_ui_integration>
  <instructions>
    <title>Integrating Material UI into Your React Project</title>
    <description>Enhance your React application with Material UI, a comprehensive React component library implementing Google's Material Design.</description>
    <steps>
      <step>
        <number>1</number>
        <description>Install Material UI Core and Styling Engine</description>
        <action>
          <command>npm install @mui/material @emotion/react @emotion/styled</command>
        </action>
        <details>
          <item>Installs the core Material UI components.</item>
          <item>Installs Emotion, the default styling engine for Material UI.</item>
        </details>
      </step>
      <step>
        <number>2</number>
        <description>Install Material UI Icons (Optional)</description>
        <action>
          <command>npm install @mui/icons-material</command>
        </action>
        <details>
          <item>Provides a comprehensive set of Material Design icons.</item>
        </details>
      </step>
      <step>
        <number>3</number>
        <description>Import and Use a Material UI Component</description>
        <action>
          <code>
            import * as React from 'react';
            import Button from '@mui/material/Button';

            function App() {
              return (
                &lt;Button variant="contained"&gt;Hello World&lt;/Button&gt;
              );
            }

            export default App;
          </code>
        </action>
        <details>
          <item>Imports the `Button` component from Material UI.</item>
          <item>Utilizes the `Button` component with the "contained" variant.</item>
        </details>
      </step>
      <step>
        <number>4</number>
        <description>Apply Global Styles with CssBaseline (Optional)</description>
        <action>
          <code>
            import * as React from 'react';
            import ReactDOM from 'react-dom';
            import CssBaseline from '@mui/material/CssBaseline';
            import App from './App';

            ReactDOM.render(
              &lt;React.StrictMode&gt;
                &lt;CssBaseline /&gt;
                &lt;App /&gt;
              &lt;/React.StrictMode&gt;,
              document.getElementById('root')
            );
          </code>
        </action>
        <details>
          <item>Resets CSS to ensure consistent styling across browsers.</item>
          <item>Provides a foundation for Material UI components.</item>
        </details>
      </step>
      <step>
        <number>5</number>
        <description>Customize the Theme (Optional)</description>
        <action>
          <code>
            import * as React from 'react';
            import ReactDOM from 'react-dom';
            import { ThemeProvider, createTheme } from '@mui/material/styles';
            import CssBaseline from '@mui/material/CssBaseline';
            import App from './App';

            const theme = createTheme({
              palette: {
                primary: {
                  main: '#1976d2',
                },
                secondary: {
                  main: '#dc004e',
                },
              },
            });

            ReactDOM.render(
              &lt;React.StrictMode&gt;
                &lt;ThemeProvider theme={theme}&gt;
                  &lt;CssBaseline /&gt;
                  &lt;App /&gt;
                &lt;/ThemeProvider&gt;
              &lt;/React.StrictMode&gt;,
              document.getElementById('root')
            );
          </code>
        </action>
        <details>
          <item>Creates a custom theme with specified primary and secondary colors.</item>
          <item>Wraps the application with `ThemeProvider` to apply the custom theme.</item>
        </details>
      </step>
      <step>
        <number>6</number>
        <description>Explore Material UI Components and Documentation</description>
        <details>
          <item>Visit the [Material UI Components](https://mui.com/material-ui/react-button/) page to explore available components.</item>
          <item>Refer to the [Material UI Documentation](https://mui.com/material-ui/getting-started/overview/) for detailed information and examples.</item>
        </details>
      </step>
    </steps>
  </instructions>

  <execution>
    <prompt>Follow these steps to integrate Material UI into your React project. For more details, refer to the [Material UI Documentation](https://mui.com/material-ui/getting-started/overview/).</prompt>
  </execution>
</material_ui_integration>
