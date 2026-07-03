/*
  Firebase configuration for the IS406 register.
  -------------------------------------------------
  1. Create/register a Firebase Web App.
  2. Copy the Firebase configuration object here.
  3. Keep the collection names unchanged unless the code is updated too.

  Firebase client configuration identifies this web app. Access is controlled
  by Firestore Security Rules, supplied in firestore.rules.
*/
window.FYP_FIREBASE_CONFIG = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

window.FYP_FIREBASE_OPTIONS = {
  projectsCollection: "projects",
  supervisorsCollection: "supervisors",
  auditCollection: "project_audit"
};
