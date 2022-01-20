import { FormValidation } from "./form-slider.js";

class SobreForm {
  constructor(form) {
    this.$form = form;
    this.$submitBtn = this.$form.find('[hs-form="submit-btn"]');
    this.init();
  }

  init() {
    this.formValidator = new FormValidation(this.$form);
    this.activateEvents();
  }

  activateEvents() {
    this.$submitBtn.click(async () => {
      if (this.isValidToSubmit()) {
        const hsRes = await this.sendDataToHS($(this.$form).serializeArray(), {
          portalId: "20885531",
          formId: "0c8a40f0-2c9b-4e74-b960-0c5d418a419c",
        });

        if (hsRes && hsRes.status !== "error") {
          window.location.replace("/pages/schedule");
        }

        this.$submitBtn
          .text("Please Wait...")
          .attr("disabled", "disabled")
          .css("cursor", "not-allowed");
      } else {
        this.$submitBtn
          .text("Try Again...")
          .removeAttr("disabled", "disabled")
          .css("cursor", "pointer");
      }
    });
  }

  isValidToSubmit() {
    const currSlideInputs = $("[data-custom-validation]");

    const isValid =
      this.formValidator.testIfArrayOfInputsAreValidate(currSlideInputs);
    return isValid;
  }

  async sendDataToHS(formData, { portalId, formId }) {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const hutk = document.cookie.replace(
      /(?:(?:^|.*;\s*)hubspotutk\s*\=\s*([^;]*).*$)|^.*$/,
      "$1"
    );

    var raw = JSON.stringify({
      fields: formData,
      context: {
        hutk,
        pageUri: window.location.href,
        pageName: document.title,
      },
    });

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
    };

    const res = await fetch(
      `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formId}`,
      requestOptions
    );

    const resData = await res.json();
    return resData;
  }
}

new SobreForm($('[hs-form="form"]'));
