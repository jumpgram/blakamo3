import { db } from "./firebase-config.js";

import {
  doc,
  getDoc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/9.5.0/firebase-firestore.js";

export async function fetchUserData(uid) {
  if (!uid) return;
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    return await userDoc.data();
  } catch (error) {
    console.log({ error });
  }
}

export async function updateUserData(uid, data) {
  if (!uid || !data) return;
  try {
    const userDoc = await doc(db, "users", uid);
    return await updateDoc(userDoc, data);
  } catch (error) {
    console.log({ error });
  }
}
