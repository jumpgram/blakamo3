import { auth, db } from "./firebase-config.js";

import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.5.0/firebase-auth.js";

import { addNewUser, handleError, webflowRoutes } from "./helpers.js";

class HandleSignUp {
  constructor(webflowRoutes) {
    this.webflowRoutes = webflowRoutes;

    this.$signupForm = document.querySelector(`[signup-form="email-password"]`);
    this.$signupFormBtn = this.$signupForm.querySelector(
      `[signup-btn="email-password"]`
    );

    this.$googleSignUpBtn = document.querySelector('[signup-btn="google"]');
    this.defaultSignupBtnText = this.$signupFormBtn.innerText;

    this.result = null;

    this.init();
  }

  init() {
    this.activateEvents();
  }

  activateEvents() {
    this.$googleSignUpBtn.addEventListener(
      "click",
      this.handleGoogleSignUp.bind(this)
    );

    this.$signupFormBtn.addEventListener("click", this.handleSignUp.bind(this));

    onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        console.log({ currentUser });
        await addNewUser(currentUser);
        this.redirectToDashboard();
      }
    });
  }

  async handleSignUp(e) {
    try {
      e.preventDefault();
      this.$signupFormBtn.innerText = "Signing up...";
      this.$signupFormBtn.disabled = true;
      const email = this.$signupForm.querySelector('[type="email"]').value;
      const password =
        this.$signupForm.querySelector('[type="password"]').value;

      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (cred.user) {
        console.log({ cred });
      } else {
        throw new Error("user not created");
      }
    } catch (error) {
      console.log({ error });
      this.$signupFormBtn.innerText = this.defaultSignupBtnText;
      this.$signupFormBtn.disabled = false;
      handleError(error);
    }
  }

  redirectToDashboard() {
    window.location.href = this.webflowRoutes.dashboard;
  }

  async handleGoogleSignUp() {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope("profile");
      provider.addScope("email");
      this.result = await signInWithPopup(auth, provider);

      const user = this.result.user;
      const credential = GoogleAuthProvider.credentialFromResult(this.result);
      const token = credential.accessToken;

      if (token) {
        console.log({ token });
      }
    } catch (error) {
      console.log({ error });
      handleError(error);
    }
  }
}

new HandleSignUp(webflowRoutes);
