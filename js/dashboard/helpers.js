import {
  setDoc,
  doc,
  getDoc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/9.5.0/firebase-firestore.js";
import { db } from "./firebase-config.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/9.5.0/firebase-auth.js";

export const webflowRoutes = {
  loginPath: "/login",
  signupPath: "/signup",
  homepage: "/",
  dashboard: "/dashboard",
};

export const serverUrl = "https://instagram-user-id.herokuapp.com";

export function handleError(error) {
  if (error.code === "auth/email-already-in-use") {
    showMsg("Email already in use", "error");
  } else if (error.code === "auth/invalid-email") {
    showMsg("Invalid email", "error");
  } else if (error.code === "auth/weak-password") {
    showMsg("Weak password", "error");
  } else if (error.code === "auth/wrong-password") {
    showMsg("Wrong password", "error");
  }
}

export function showMsg(msg, type, place) {
  let $msgBox = document.querySelector(".msg-box");
  if (!$msgBox) {
    $msgBox = document.createElement("div");
    if (place) {
      place.appendChild($msgBox);
    } else {
      document.querySelector("body").appendChild($msgBox);
    }
  } else {
    $msgBox.style.display = "none";
  }
  $msgBox.classList.add("msg-box");
  $msgBox.style.display = "block";
  $msgBox.innerText = msg;
  if (type === "error") {
    $msgBox.classList.add("error");
  } else if (type === "success") {
    $msgBox.classList.add("success");
  }

  setTimeout(() => {
    $msgBox.style.display = "none";
    $msgBox.classList.remove("error");
    $msgBox.classList.remove("success");
  }, 3000);
}

export async function addNewUser(userData) {
  if (!userData) return;
  const userDoc = {
    name: userData.displayName || "",
    email: userData.email,
    last_login: new Date().toISOString(),
  };
  try {
    const docRef = doc(db, "users", userData.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      await updateDoc(docRef, {
        last_login: new Date().toISOString(),
      });
    } else {
      console.log("No such document!");
      await setDoc(doc(db, "users", userData.uid), userDoc);
      console.log("Document written: ", userData.uid);
    }
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

export function getCurrentUserInfo() {
  const auth = getAuth();
  const user = auth.currentUser;
  console.log({ user });
  return user;
}

export function redirectUserToFSLogin(token) {
  if (token) {
    window.location.href = `http://app.jumpgram.co/#${token}`;
  }
}

export function getPhotoURLWithFS(url) {
  return `https://corset.flocksocial.io/${url}`;
}
