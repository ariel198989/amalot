<firebase_integration>
  <instructions>
    <title>Integrating Firebase into Your React Project</title>
    <description>Enhance your React application with Firebase, a comprehensive platform offering backend services such as authentication, real-time databases, and hosting.</description>
    <steps>
      <step>
        <number>1</number>
        <description>Create a Firebase Project</description>
        <details>
          <item>Navigate to the [Firebase Console](https://console.firebase.google.com/) and sign in with your Google account.</item>
          <item>Click on "Add project" and follow the prompts to set up your new project.</item>
          <item>After creation, you'll be directed to your project's dashboard.</item>
        </details>
      </step>
      <step>
        <number>2</number>
        <description>Register Your App with Firebase</description>
        <details>
          <item>In the Firebase console, click on the web icon (</>) to add Firebase to your web app.</item>
          <item>Provide a nickname for your app and register it.</item>
          <item>After registration, you'll receive a Firebase configuration object containing your app's Firebase credentials.</item>
        </details>
      </step>
      <step>
        <number>3</number>
        <description>Install Firebase SDK</description>
        <action>
          <command>npm install firebase</command>
        </action>
        <details>
          <item>Installs the Firebase JavaScript SDK into your React project.</item>
        </details>
      </step>
      <step>
        <number>4</number>
        <description>Initialize Firebase in Your React App</description>
        <action>
          <code>
            import { initializeApp } from 'firebase/app';

            const firebaseConfig = {
              apiKey: 'YOUR_API_KEY',
              authDomain: 'YOUR_AUTH_DOMAIN',
              projectId: 'YOUR_PROJECT_ID',
              storageBucket: 'YOUR_STORAGE_BUCKET',
              messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
              appId: 'YOUR_APP_ID',
            };

            const app = initializeApp(firebaseConfig);
          </code>
        </action>
        <details>
          <item>Replace the placeholder strings (e.g., 'YOUR_API_KEY') with the corresponding values from your Firebase configuration object.</item>
          <item>Initializes Firebase with your project's specific configuration.</item>
        </details>
      </step>
      <step>
        <number>5</number>
        <description>Set Up Firebase Services (Optional)</description>
        <details>
          <item>Depending on your application's needs, you can set up additional Firebase services such as Authentication, Firestore, or Storage.</item>
          <item>For example, to set up Firestore:</item>
          <action>
            <code>
              import { getFirestore } from 'firebase/firestore';

              const db = getFirestore(app);
            </code>
          </action>
          <item>Refer to the [Firebase Documentation](https://firebase.google.com/docs) for detailed setup instructions for each service.</item>
        </details>
      </step>
      <step>
        <number>6</number>
        <description>Deploy Your App Using Firebase Hosting (Optional)</description>
        <details>
          <item>Install the Firebase CLI:</item>
          <action>
            <command>npm install -g firebase-tools</command>
          </action>
          <item>Log in to Firebase:</item>
          <action>
            <command>firebase login</command>
          </action>
          <item>Initialize Firebase in your project directory:</item>
          <action>
            <command>firebase init</command>
          </action>
          <item>Follow the prompts to set up Firebase Hosting and deploy your app.</item>
          <item>Refer to the [Firebase Hosting Documentation](https://firebase.google.com/docs/hosting) for more details.</item>
        </details>
      </step>
    </steps>
  </instructions>

  <execution>
    <prompt>Follow these steps to integrate Firebase into your React project. For more details, refer to the [Firebase Documentation](https://firebase.google.com/docs).</prompt>
  </execution>
</firebase_integration>
