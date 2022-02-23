const STAPIURL = `https://jumpgram-strapi.herokuapp.com/api/insta-users`;

class HandleUserRedirection {
  constructor() {
    this.RETRY_KEY = "retry-count";
    this.init();
  }

  init() {
    this.resetRetryCount();
    this.getUserTokenFromStrapi();
  }

  async getUserTokenFromStrapi() {
    console.log("getUserTokenFromStrapi");
    const username = this.getUserNameFromURL();
    if (username) {
      
      const response = await fetch(
        `${STAPIURL}?filters[username][$eq]=${username}&sort[0]=publishedAt%3Adesc&pagination[limit]=1`
      );
      const resData = await response.json();
      console.log(resData);
      if (resData && resData.data && resData.data.length > 0) {
        const user = resData.data[0];
        this.redirectToUserProfile(user);
      } else {
        setTimeout(() => {
          this.retryToGetUserTokenFromStrapi();
        }, 5000);
      }
    } else {
      document.querySelector(".loader").style.display = "none";
      document.querySelector(
        "[page-title='true']"
      ).innerHTML = `Username is missing in the URL`;
    }
  }

  getUserNameFromURL() {
    const url = new URL(window.location.href);
    const username = url.searchParams.get("username");
    return username || null;
  }

  redirectToUserProfile(user) {
    const { token } = user?.attributes || {};
    const url = `http://app.jumpgram.co/#${token}`;
    window.location.href = url;
  }

  retryToGetUserTokenFromStrapi() {
    const retryCount = this.getRetryCount();
    if (retryCount < 15) {
      this.setRetryCount(retryCount + 1);
      this.getUserTokenFromStrapi();
    } else {
      document.querySelector(".loader").style.display = "none";
      document.querySelector(
        "[page-title='true']"
      ).innerHTML = `Unable to get user token, Please contact at melissa@jumpgram.co`;
    }
  }

  getRetryCount() {
    const retryCount = parseInt(localStorage.getItem(this.RETRY_KEY) || 0);
    return retryCount;
  }

  setRetryCount(retryCount) {
    localStorage.setItem(this.RETRY_KEY, retryCount);
  }

  incrementRetryCount() {
    const retryCount = this.getRetryCount();
    this.setRetryCount(retryCount + 1);
  }

  resetRetryCount() {
    localStorage.removeItem(this.RETRY_KEY);
  }
}

new HandleUserRedirection();
