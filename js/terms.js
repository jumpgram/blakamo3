class TermsPageHandle {
  constructor() {
    this.username = null;
    this.$btn = $('[terms="btn"]');
    this.currTerm = 1;
    this.init();
  }

  init() {
    this.termsParaToHide = $("[terms-con='2'], [terms-con='3']").hide();
    this.initUserName();
    this.activateEvents();
  }

  initUserName() {
    const url = new URL(window.location.href);
    const username = url.searchParams.get("username");
    this.username = username;
  }

  activateEvents() {
    this.$btn.on("click", () => {
      $(`[terms-con=${this.currTerm}]`).fadeOut();
      $(`[terms-con=${this.currTerm + 1}]`).fadeIn();

      if (this.currTerm === 2) {
        this.$btn.text("Sign Up");
      }

      if (this.currTerm === 3) {
        this.moveToSearchPage();
      }

      this.currTerm++;
    });
  }

  moveToSearchPage() {
    window.location.href = `/success.html?username=${this.username}`;
  }
}

new TermsPageHandle();
