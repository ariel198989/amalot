<tsParticles_integration>
  <instructions>
    <title>Integrating tsParticles into Your Project</title>
    <description>Enhance your web application with highly customizable particles, confetti, and fireworks animations using tsParticles.</description>
    <steps>
      <step>
        <number>1</number>
        <description>Install tsParticles via npm</description>
        <action>
          <command>npm install tsparticles</command>
        </action>
        <details>
          <item>Installs the tsParticles library into your project.</item>
        </details>
      </step>
      <step>
        <number>2</number>
        <description>Import and Initialize tsParticles</description>
        <action>
          <code>
            import { tsParticles } from 'tsparticles';

            tsParticles.load('tsparticles', {
              /* options here */
            });
          </code>
        </action>
        <details>
          <item>Imports the `tsParticles` instance from the library.</item>
          <item>Initializes tsParticles with a configuration object.</item>
        </details>
      </step>
      <step>
        <number>3</number>
        <description>Add a Container Element</description>
        <action>
          <code>
            &lt;div id="tsparticles"&gt;&lt;/div&gt;
          </code>
        </action>
        <details>
          <item>Creates a `div` element with the ID `tsparticles` to serve as the container for the particles animation.</item>
        </details>
      </step>
      <step>
        <number>4</number>
        <description>Configure Particle Options</description>
        <details>
          <item>Define particle properties such as number, color, shape, opacity, size, and movement within the options object.</item>
          <item>Refer to the [tsParticles Options Documentation](https://particles.js.org/docs/) for detailed configuration options.</item>
        </details>
      </step>
      <step>
        <number>5</number>
        <description>Explore Presets and Plugins</description>
        <details>
          <item>Utilize predefined presets for common particle configurations.</item>
          <item>Extend functionality with plugins for additional features like polygon masks and emitters.</item>
          <item>Visit the [tsParticles Presets](https://particles.js.org/docs/) and [Plugins](https://particles.js.org/docs/) pages for more information.</item>
        </details>
      </step>
      <step>
        <number>6</number>
        <description>Integrate with Frameworks</description>
        <details>
          <item>Use official components for frameworks such as React, Vue.js, Angular, Svelte, and more.</item>
          <item>Refer to the [tsParticles Frameworks Integration](https://particles.js.org/) page for specific instructions.</item>
        </details>
      </step>
    </steps>
  </instructions>

  <execution>
    <prompt>Follow these steps to integrate tsParticles into your project. For more details, refer to the [tsParticles Documentation](https://particles.js.org/docs/).</prompt>
  </execution>
</tsParticles_integration>
