import { auth } from "./firebase-config.js";

import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from "https://www.gstatic.com/firebasejs/9.5.0/firebase-auth.js";

import { webflowRoutes, handleError, addNewUser, showMsg } from "./helpers.js";

class HandleLogin {
  constructor(webflowRoutes) {
    this.webflowRoutes = webflowRoutes;

    this.$signupForm = document.querySelector(`[signup-form="email-password"]`);
    this.$signupFormBtn = this.$signupForm.querySelector(
      `[signup-btn="email-password"]`
    );

    this.$googleSignUpBtn = document.querySelector('[signup-btn="google"]');
    this.defaultSignupBtnText = this.$signupFormBtn.innerText;

    this.$forgotPwShowBtn = document.querySelector("[show-btn='forgot-pw']");
    this.$loginShowBtn = document.querySelector("[show-btn='login']");

    this.$forgotPwBlock = document.querySelector("[type-of='forgot-pw']");
    this.$loginBlock = document.querySelector("[type-of='login']");

    this.$forgotEmailInput =
      this.$forgotPwBlock.querySelector("[type='email']");
    this.$forgotPwBtn = this.$forgotPwBlock.querySelector(
      "[signup-btn='forgot-pw']"
    );

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
        await addNewUser(currentUser);
        this.redirectToDashboard();
      }
    });

    this.$forgotPwShowBtn.addEventListener("click", () => {
      this.showHideBlocks("forgot-pw");
    });

    this.$forgotPwBtn.addEventListener(
      "click",
      this.handlePasswordReset.bind(this)
    );

    this.$loginShowBtn.addEventListener("click", () =>
      this.showHideBlocks("login")
    );
  }

  async handleSignUp(e) {
    try {
      e.preventDefault();
      this.$signupFormBtn.innerText = "Signing up...";
      this.$signupFormBtn.disabled = true;
      const email = this.$signupForm.querySelector('[type="email"]').value;
      const password =
        this.$signupForm.querySelector('[type="password"]').value;

      const cred = await signInWithEmailAndPassword(auth, email, password);
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
    }
  }

  showHideBlocks(showType) {
    if (showType === "forgot-pw") {
      this.$forgotPwBlock.style.display = "flex";
      this.$loginBlock.style.display = "none";
    } else {
      this.$forgotPwBlock.style.display = "none";
      this.$loginBlock.style.display = "flex";
    }
  }

  async handlePasswordReset() {
    try {
      const email = this.$forgotEmailInput.value;
      if (!email && email.length < 1) {
        showMsg("Please enter your email address", "error");
        return;
      }

      sendPasswordResetEmail(auth, email)
        .then((data) => {
          console.log("sendPasswordResetEmail", data);
          showMsg(
            "Password reset email sent, Please check your email.",
            "success"
          );
        })
        .catch((error) => {
          if (error.code === "auth/user-not-found") {
            showMsg("User not found", "error");
          } else if (error.code === "auth/invalid-email") {
            showMsg("Invalid email address", "error");
          } else {
            showMsg("Something went wrong", "error");
          }
        });
    } catch (error) {
      console.log({ error });
    }
  }
}

new HandleLogin(webflowRoutes);
