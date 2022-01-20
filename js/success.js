const STAPIURL = `https://jumpgram-strapi.herokuapp.com/api/insta-users`;

class HandleUserRedirection {
  constructor() {
    this.init();
  }

  init() {
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

      if (resData && resData.data && resData.data.length > 0) {
        const user = resData.data[0];
        this.redirectToUserProfile(user);
      } else {
        document.querySelector(
          "[page-title='true']"
        ).innerHTML = `No User Found with username ${username}`;
        document.querySelector(".loader").style.display = "none";
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
}

new HandleUserRedirection();
