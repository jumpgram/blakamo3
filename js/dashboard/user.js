import { auth } from "./firebase-config.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.5.0/firebase-auth.js";

import { serverUrl, webflowRoutes } from "./helpers.js";
import { fetchUserData } from "./firestore-helpers.js";
import "./insta-modal.js";
import { UserProfile } from "./user-profile.js";
import { HandleUserTargetsTab } from "./user-targets.js";

class HandleInstaConnection {
  constructor(user) {
    this.user = user;
    this.$profileBlock = document.querySelector("[user-acc='found']");
    this.$noProfileBlock = document.querySelector("[user-acc='not-found']");
    this.init();
  }

  init() {
    this.checkIfUserHasAccountLinked();
  }

  activateEvents() {
    $("#email-form-2").on("submit", (e) => {
      e.preventDefault();
      return false;
    });
  }

  async checkIfUserHasAccountLinked() {
    const user = this.user;
    const userId = user.uid;
    const userData = await fetchUserData(userId);
    console.log({ userData });
    if (userData?.insta_connected) {
      this.hideNoProfileBlock();
      this.showProfileBlock();
      this.userProfile = new UserProfile(userData);
      this.userTargets = new HandleUserTargetsTab(userData);
    } else {
      this.hideProfileBlock();
      this.showNoProfileBlock();
    }
  }

  hideNoProfileBlock() {
    this.$noProfileBlock && (this.$noProfileBlock.style.display = "none");
  }

  showNoProfileBlock() {
    this.$noProfileBlock && (this.$noProfileBlock.style.display = "block");
  }

  hideProfileBlock() {
    this.$profileBlock && (this.$profileBlock.style.display = "none");
    $(".side-dashboard-block .profile-col").eq(1).css({
      cursor: "wait",
      "pointer-events": "none",
    });
  }

  showProfileBlock() {
    this.$profileBlock && (this.$profileBlock.style.display = "block");
  }
}

class HandleTabState {
  constructor() {
    this.$tabs = document.querySelectorAll("[menu]");
    this.TAB_LS_NAME = "tab";
    this.init();
  }

  init() {
    this.handleLoad();
    this.activateEvents();
  }

  activateEvents() {
    this.$tabs.forEach((tab) => {
      tab.addEventListener("click", (e) => {
        this.handleTabClick(e);
      });
    });
  }

  handleTabClick(e) {
    const $tab = e.currentTarget;
    const tab = $tab.getAttribute("menu");
    if (tab) {
      this.updateStateInLS(tab);
    }
  }

  updateStateInLS(tab) {
    if (!tab) return;
    const state = {
      tab,
    };
    localStorage.setItem(this.TAB_LS_NAME, JSON.stringify(state));
  }

  getStateFromLS() {
    const state = localStorage.getItem(this.TAB_LS_NAME);
    if (state) {
      return JSON.parse(state);
    }
    return null;
  }

  getTabFromLS() {
    const state = this.getStateFromLS();
    if (state) {
      return state.tab;
    }
    return null;
  }

  handleLoad() {
    const tab = this.getTabFromLS();
    if (tab) {
      const $menuBtn = document.querySelector(`[menu="${tab}"]`);
      setTimeout(() => {
        $menuBtn.click();
      }, 500);
    }
  }
}

class HandleDashboard {
  constructor() {
    this.$menuBtns = document.querySelectorAll("[menu]");
    this.$tabs = document.querySelectorAll("[tab]");
    this.$signOutBtn = document.querySelector("[user-btn='logout']");

    // this.$searchInput = document.querySelector("[user-search='input']");
    // this.$searchBtn = document.querySelector("[user-search='btn']");
    // this.searchBtnDefaultText = this.$searchBtn.textContent;

    this.$targetBlocks = document.querySelectorAll(".targets-block");

    this.$instaCardsFoundBlock = document.querySelector(
      '[insta-targets="search"]'
    );

    console.log({ $instaCardsFoundBlock: this.$instaCardsFoundBlock });

    this.instaCardClone = document
      .querySelector("[insta-card='card']")
      .cloneNode(true);

    this.instaUsers = [];

    this.init();
  }

  init() {
    this.hideTargetBlocks();
    this.activateServer();
    this.activateEvents();
  }

  activateEvents() {
    this.$menuBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.handleMenuBtnClick(e);
      });
    });

    this.$signOutBtn.addEventListener("click", (e) => {
      this.handleSignOutBtnClick(e);
    });

    // this.$searchBtn.addEventListener("click", (e) => {
    //   this.handleSearchBtnClick(e);
    // });
  }

  showTargetBlocks() {
    this.$targetBlocks.forEach((block) => {
      block.style.display = "block";
    });
  }

  hideTargetBlocks() {
    this.$targetBlocks.forEach((block) => {
      block.style.display = "none";
    });
  }

  initInstaCardsBlock(users, type = "remove") {
    this.$instaCardsFoundBlock.innerHTML = "";
    users.forEach(({ user }) => {
      const instaCard = this.instaCardClone.cloneNode(true);
      instaCard.querySelector("[insta-card='username']").textContent =
        user.full_name;
      instaCard.querySelector(
        "[insta-card='profile-pic']"
      ).src = `https://corset.flocksocial.io/${user["profile_pic_url"]}`;
      const cardBtn = instaCard.querySelector("[insta-card='btn']");
      cardBtn.setAttribute("insta-pk", user?.pk);
      cardBtn.setAttribute("btn-type", type);

      this.$instaCardsFoundBlock.appendChild(instaCard);
    });
  }

  async handleSearchBtnClick(e) {
    // this.$searchBtn.innerText = "Please wait...";
    // const inputValue = this.$searchInput.value;
    // this.instaUsers = await this.getInstaUsersByUserName(inputValue);
    // this.initInstaCardsBlock(this.instaUsers);
    // this.showTargetBlocks();
    // this.$searchInput.value = "";
    // this.$searchBtn.innerText = this.searchBtnDefaultText;
  }

  async getInstaUsersByUserName(username) {
    if (!username) return;
    try {
      const resData = await fetch(`${serverUrl}/insta/users/${username}`);
      const { usersProfileArr } = await resData.json();
      return usersProfileArr;
    } catch (error) {
      console.log({ error });
    }
  }

  async activateServer() {
    console.log("activating");
    try {
      const resData = await fetch(serverUrl);
      const data = await resData.json();
      return data;
    } catch (error) {
      console.log({ error });
    }
  }

  showInstaProfiles() {
    if (instaUsers.length) {
      hideModalInfo();
      const profilesDom = instaUsers.map(({ user }) => {
        return `<div class="insta-profile-card">
      <div class="insta-profile-pic-holder">
      <img src="https://corset.flocksocial.io/${user.profile_pic_url}" alt="" class="instagram-profile-pic">
      </div>
      <div class="instagram-card-username">
      ${user.full_name}
      </div>
      <a href="#" data-insta-get="true" data-user-pk=${user.pk} data-user-name=${user.username} class="custom-button for-card w-button">Select</a>
      </div>`;
      });

      $(".profiles-holder").empty();
      $(".profiles-holder").append(profilesDom).slideDown();
    } else {
      $(".profiles-holder").empty();
      showModalInfo("No Users Found");
    }
  }

  handleSignOutBtnClick(e) {
    auth.signOut();
  }

  handleMenuBtnClick(e) {
    const $menuBtn = e.currentTarget;
    const $tab = document.querySelector(
      `[tab="${$menuBtn.getAttribute("menu")}"]`
    );

    this.$menuBtns.forEach((btn) => {
      btn.classList.remove("active");
    });

    $menuBtn.classList.add("active");

    this.$tabs.forEach((tab) => {
      tab.classList.remove("active");
    });

    $tab.classList.add("active");
  }
}

class HandleUser {
  constructor() {
    this.init();
  }

  init() {
    this.showLoading();
    this.activateEvents();
  }

  initializeDashboard() {
    this.dashboard = new HandleDashboard();
  }

  initializeInsta(currentUser) {
    this.instaConnection = new HandleInstaConnection(currentUser);
  }

  activateEvents() {
    onAuthStateChanged(auth, (currentUser) => {
      console.log({ currentUser });
      if (!currentUser) {
        this.redirectToSignIn();
      } else {
        this.initializeInsta(currentUser);
        this.initializeDashboard();
        new HandleTabState();

        setTimeout(async () => {
          this.hideLoading();
        }, 1000);
      }
    });
  }

  hideLoading() {
    document.querySelector(".loading-sec").style.display = "none";
    document.querySelectorAll(".user-details-col").forEach((ele) => {
      ele.style.opacity = "1";
    });
  }

  showLoading() {
    document.querySelector(".loading-sec").style.display = "flex";
  }

  redirectToSignIn() {
    window.location.href = webflowRoutes.loginPath;
  }

  checkIfUserInstaConnected() {
    const user = auth.currentUser;
    if (user) {
      const userRef = firestore.collection("users").doc(user.uid);
      userRef.get().then((doc) => {
        if (doc.exists) {
          const data = doc.data();
          if (data.insta_connected) {
            this.initializeDashboard();
          } else {
            this.redirectToSignIn();
          }
        } else {
          this.redirectToSignIn();
        }
      });
    }
    return false;
  }
}

new HandleUser();
