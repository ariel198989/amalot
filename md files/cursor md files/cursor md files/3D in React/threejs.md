<threejs_setup>
  <instructions>
    <title>How to Set Up a Basic Three.js Project</title>
    <description>Create a simple Three.js project to render 3D graphics in your web application.</description>
    <steps>
      <step>
        <number>1</number>
        <description>Install Three.js</description>
        <action>
          <command>npm install three</command>
        </action>
        <details>
          <item>Installs the Three.js library as a dependency in your project.</item>
        </details>
      </step>
      <step>
        <number>2</number>
        <description>Import Three.js</description>
        <action>
          <code>
            import * as THREE from 'three';
          </code>
        </action>
        <details>
          <item>Imports all functionalities of Three.js under the `THREE` namespace.</item>
        </details>
      </step>
      <step>
        <number>3</number>
        <description>Create a Scene, Camera, and Renderer</description>
        <action>
          <code>
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            const renderer = new THREE.WebGLRenderer();
            renderer.setSize(window.innerWidth, window.innerHeight);
            document.body.appendChild(renderer.domElement);
          </code>
        </action>
        <details>
          <item>Initializes a scene, a perspective camera, and a WebGL renderer.</item>
          <item>Sets the renderer's size to the window dimensions and appends its canvas element to the document body.</item>
        </details>
      </step>
      <step>
        <number>4</number>
        <description>Add a Cube to the Scene</description>
        <action>
          <code>
            const geometry = new THREE.BoxGeometry();
            const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
            const cube = new THREE.Mesh(geometry, material);
            scene.add(cube);
            camera.position.z = 5;
          </code>
        </action>
        <details>
          <item>Creates a cube geometry and applies a basic material to it.</item>
          <item>Adds the cube to the scene and positions the camera to view it.</item>
        </details>
      </step>
      <step>
        <number>5</number>
        <description>Animate the Cube</description>
        <action>
          <code>
            function animate() {
              requestAnimationFrame(animate);
              cube.rotation.x += 0.01;
              cube.rotation.y += 0.01;
              renderer.render(scene, camera);
            }
            animate();
          </code>
        </action>
        <details>
          <item>Defines an animation loop to rotate the cube continuously.</item>
          <item>Renders the scene and camera on each animation frame.</item>
        </details>
      </step>
    </steps>
  </instructions>

  <execution>
    <prompt>Follow these steps to set up and animate a basic Three.js scene. For more details, refer to the [Three.js Documentation](https://threejs.org/docs/).</prompt>
  </execution>
</threejs_setup>
