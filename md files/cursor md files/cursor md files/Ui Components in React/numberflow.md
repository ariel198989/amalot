<numberflow_integration>
  <instructions>
    <title>Integrating NumberFlow into Your React Project</title>
    <description>Enhance your React application with NumberFlow, a component that transitions, formats, and localizes numbers. It's dependency-free, accessible, and customizable.</description>
    <steps>
      <step>
        <number>1</number>
        <description>Install NumberFlow</description>
        <action>
          <command>npm install @number-flow/react</command>
        </action>
        <details>
          <item>Installs the NumberFlow package for React into your project.</item>
        </details>
      </step>
      <step>
        <number>2</number>
        <description>Import and Use the NumberFlow Component</description>
        <action>
          <code>
            import NumberFlow from '@number-flow/react';

            function App() {
              return &lt;NumberFlow value={123} /&gt;;
            }

            export default App;
          </code>
        </action>
        <details>
          <item>Imports the `NumberFlow` component from the installed package.</item>
          <item>Utilizes the `NumberFlow` component in your React component, displaying the number 123 with default formatting and transitions.</item>
        </details>
      </step>
      <step>
        <number>3</number>
        <description>Customize Number Formatting</description>
        <action>
          <code>
            &lt;NumberFlow
              value={value}
              format={{ notation: 'compact' }}
              locales="en-US"
            /&gt;
          </code>
        </action>
        <details>
          <item>Uses the `format` prop to apply `Intl.NumberFormat` options, such as compact notation.</item>
          <item>Sets the `locales` prop to define the locale for number formatting.</item>
        </details>
      </step>
      <step>
        <number>4</number>
        <description>Configure Animation Timings</description>
        <action>
          <code>
            &lt;NumberFlow
              value={value}
              transformTiming={{ duration: 750, easing: 'linear' }}
              spinTiming={{ duration: 750, easing: 'linear' }}
              opacityTiming={{ duration: 350, easing: 'ease-out' }}
            /&gt;
          </code>
        </action>
        <details>
          <item>Adjusts the `transformTiming`, `spinTiming`, and `opacityTiming` props to customize animation durations and easing functions.</item>
        </details>
      </step>
      <step>
        <number>5</number>
        <description>Explore Additional Props and Features</description>
        <details>
          <item>Utilize props like `trend`, `continuous`, `isolate`, and `animated` to control animation behaviors.</item>
          <item>Refer to the [NumberFlow Documentation](https://number-flow.barvian.me/) for detailed information on all available props and customization options.</item>
        </details>
      </step>
      <step>
        <number>6</number>
        <description>Style the NumberFlow Component</description>
        <details>
          <item>Apply custom styles using CSS properties such as `--number-flow-mask-height`, `--number-flow-mask-width`, and `--number-flow-char-height`.</item>
          <item>Ensure consistent digit widths by setting `font-variant-numeric: tabular-nums;`.</item>
          <item>Refer to the [Styling Section](https://number-flow.barvian.me/#styling) in the documentation for more details.</item>
        </details>
      </step>
    </steps>
  </instructions>

  <execution>
    <prompt>Follow these steps to integrate NumberFlow into your React project. For more details, refer to the [NumberFlow Documentation](https://number-flow.barvian.me/).</prompt>
  </execution>
</numberflow_integration>
