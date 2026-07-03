import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  addDoc,
  serverTimestamp,
  writeBatch
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const config = window.FYP_FIREBASE_CONFIG || {};
const options = window.FYP_FIREBASE_OPTIONS || {};
const requiredConfig = ["apiKey", "authDomain", "projectId", "appId"];

export const isFirebaseConfigured = requiredConfig.every((key) => {
  const value = String(config[key] || "").trim();
  return value.length > 0 && !value.includes("REPLACE");
});

export const projectCollectionName = options.projectsCollection || "projects";
export const supervisorsCollectionName = options.supervisorsCollection || "supervisors";
export const auditCollectionName = options.auditCollection || "project_audit";

let app = null;
let auth = null;
let db = null;

if (isFirebaseConfigured) {
  app = getApps().length ? getApps()[0] : initializeApp(config);
  auth = getAuth(app);
  db = getFirestore(app);
}

function ensureConfigured() {
  if (!isFirebaseConfigured || !auth || !db) {
    throw new Error("Firebase has not been configured. Add the project configuration in assets/firebase-config.js.");
  }
}

export function observeAuth(callback) {
  ensureConfigured();
  return onAuthStateChanged(auth, callback);
}

export function signIn(email, password) {
  ensureConfigured();
  return signInWithEmailAndPassword(auth, email, password);
}

export function signOutUser() {
  ensureConfigured();
  return signOut(auth);
}

export async function getSupervisorProfile(uid) {
  ensureConfigured();
  const reference = doc(db, supervisorsCollectionName, uid);
  const snapshot = await getDoc(reference);
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
}

export function observeProjects(onChange, onError) {
  ensureConfigured();
  return onSnapshot(collection(db, projectCollectionName), (snapshot) => {
    const projects = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
    onChange(projects);
  }, onError);
}

export async function saveProject(project, userEmail) {
  ensureConfigured();
  const id = String(project.id || "").trim();
  if (!id) throw new Error("The project record needs a permanent ID.");

  const payload = {
    ...project,
    id,
    updatedAt: serverTimestamp(),
    updatedBy: userEmail || "Supervisor"
  };
  await setDoc(doc(db, projectCollectionName, id), payload, { merge: true });

  await addDoc(collection(db, auditCollectionName), {
    projectId: id,
    projectTitle: String(project.title || ""),
    action: "Project record updated",
    updatedBy: userEmail || "Supervisor",
    updatedAt: serverTimestamp()
  });
}

export async function seedProjects(projects, userEmail) {
  ensureConfigured();
  const batch = writeBatch(db);
  projects.forEach((project) => {
    const id = String(project.id || "").trim();
    if (!id) return;
    batch.set(doc(db, projectCollectionName, id), {
      ...project,
      id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      updatedBy: userEmail || "Supervisor"
    }, { merge: true });
  });
  await batch.commit();

  await addDoc(collection(db, auditCollectionName), {
    action: "Initial project register seeded",
    records: projects.length,
    updatedBy: userEmail || "Supervisor",
    updatedAt: serverTimestamp()
  });
}
