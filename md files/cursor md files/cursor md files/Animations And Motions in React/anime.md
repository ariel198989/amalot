<animejs_integration>
  <instructions>
    <title>Integrating Anime.js into Your Project</title>
    <description>Enhance your web application with smooth and powerful animations using Anime.js, a lightweight JavaScript animation library.</description>
    <steps>
      <step>
        <number>1</number>
        <description>Install Anime.js via npm</description>
        <action>
          <command>npm install animejs</command>
        </action>
        <details>
          <item>Installs the Anime.js library into your project.</item>
        </details>
      </step>
      <step>
        <number>2</number>
        <description>Import Anime.js into Your JavaScript File</description>
        <action>
          <code>
            import anime from 'animejs/lib/anime.es.js';
          </code>
        </action>
        <details>
          <item>Imports the Anime.js module into your JavaScript file.</item>
        </details>
      </step>
      <step>
        <number>3</number>
        <description>Create a Basic Animation</description>
        <action>
          <code>
            anime({
              targets: '.element',
              translateX: 250,
              duration: 1000,
              easing: 'easeInOutQuad'
            });
          </code>
        </action>
        <details>
          <item>Selects the element with the class `element` to animate.</item>
          <item>Moves the element 250 pixels to the right over 1000 milliseconds.</item>
          <item>Applies the 'easeInOutQuad' easing function for a smooth transition.</item>
        </details>
      </step>
      <step>
        <number>4</number>
        <description>Explore Advanced Animations</description>
        <details>
          <item>Utilize keyframes to create complex animations.</item>
          <item>Implement staggering for sequential animations.</item>
          <item>Control animations with timelines for synchronized sequences.</item>
          <item>Refer to the [Anime.js Documentation](https://animejs.com/documentation/) for detailed information on advanced features.</item>
        </details>
      </step>
      <step>
        <number>5</number>
        <description>Experiment with Demos and Examples</description>
        <details>
          <item>Visit the [Anime.js Examples](https://animejs.com/) page to see various animations in action.</item>
          <item>Explore the [CodePen Collection](https://codepen.io/collection/nVYWZR/) for community-contributed examples.</item>
        </details>
      </step>
    </steps>
  </instructions>

  <execution>
    <prompt>Follow these steps to integrate Anime.js into your project. For more details, refer to the [Anime.js Documentation](https://animejs.com/documentation/).</prompt>
  </execution>
</animejs_integration>
