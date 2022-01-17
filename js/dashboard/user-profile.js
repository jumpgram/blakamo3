import {
  getPhotoURLWithFS,
  redirectUserToFSLogin,
  serverUrl,
} from "./helpers.js";

export class UserProfile {
  constructor(userData) {
    this.$userName = document.querySelector("[user-profile='username']");
    this.$name = document.querySelector("[user-profile='name']");
    this.$email = document.querySelector("[user-profile='email']");
    this.$mobile = document.querySelector("[user-profile='mobile']");
    this.$followers = document.querySelector("[user-profile='followers']");
    this.$following = document.querySelector("[user-profile='following']");
    this.$profilePic = document.querySelector("[user-profile='profile-img']");
    this.$instaConnectedText = document.querySelector(
      "[user-profile='is-connected']"
    );

    this.$isInCooldownMode = document.querySelector(
      "[user-profile='is-in-cooldown']"
    );
    this.$connectBtn = document.querySelector("[user-profile='connect-btn']");

    this.userData = userData;
    this.init();
  }

  init() {
    this.activateEvents();
    this.showDataFromFB();
    this.fetchAndShowDataFromAPI();
  }

  activateEvents() {
    console.log("activating events");
    this.$connectBtn.addEventListener("click", () => {
      redirectUserToFSLogin(this.userData.token);
    });
  }

  showDataFromFB() {
    console.log("fetching data from FB");

    this.$userName.innerText = this.userData.username;
    this.$name.innerText = this.userData.name;
    this.$email.innerText = this.userData.email;
    this.$mobile.innerText = this.userData.mobile
      ? this.userData.mobile
      : "Not Connected";
  }

  async fetchAndShowDataFromAPI() {
    const data = await fetch(`${serverUrl}/get-user-data/${this.userData.pk}`);
    const userDataFromAPI = await data.json();
    console.log({ userDataFromAPI });

    if (
      userDataFromAPI &&
      userDataFromAPI.success === true &&
      userDataFromAPI.user
    ) {
      const { followers, following, profile_pic_url } =
        userDataFromAPI.user.account;

      const { cooldown } = userDataFromAPI.user;

      this.$instaConnectedText.innerText = userDataFromAPI.user.connected
        ? "Connected"
        : "Not Connected";
      this.$followers.innerText = followers;
      this.$following.innerText = following;
      this.removePhotoAttr();
      this.$profilePic.src = getPhotoURLWithFS(profile_pic_url);
      if (cooldown) {
        this.$isInCooldownMode.innerText = cooldown.is_active
          ? "Active"
          : "In Active";
      }
      if (userDataFromAPI.user.connected) {
        this.$connectBtn.style.display = "none";
      } else {
        this.$connectBtn.style.display = "block";
      }
    }
  }

  removePhotoAttr() {
    this.$profilePic.removeAttribute("src");
    this.$profilePic.removeAttribute("sizes");
    this.$profilePic.removeAttribute("srcset");
  }
}
