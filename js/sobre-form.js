import { FormValidation } from "../form-slider.js";

class SobreForm {
  constructor(form) {
    this.$form = form;
    this.$crpInput = $('[sobre-form="crp-input"]');
    this.$crpCheckBox = $('[crp-input="true"]');
    this.$submitBtn = this.$form.find('[sobre-form="submit-btn"]');
    this.init();
  }

  init() {
    this.$crpInput.parents(".form-input-holder-custom").hide();
    this.formValidator = new FormValidation(this.$form);
    this.activateEvents();
  }

  activateEvents() {
    $('.espi-imag-block [type="checkbox"]').on("change", (evt) => {
      const $checkBoxes = $('.espi-imag-block [type="checkbox"]');
      $checkBoxes.each((idx, eachBox) => {
        if (eachBox !== evt.currentTarget) {
          $(eachBox).siblings("div").removeClass("w--redirected-checked");
          eachBox.checked = false;
          this.$crpInput.parents(".form-input-holder-custom").fadeOut();
          this.$crpInput.removeAttr("required");
        }
      });

      if (
        this.$crpCheckBox[0] === evt.currentTarget &&
        this.$crpCheckBox[0].checked
      ) {
        this.$crpInput.parents(".form-input-holder-custom").fadeIn();
        this.$crpInput.attr("required", true);
      }
    });

    this.$submitBtn.click(() => {
      if (this.isValidToSubmit()) {
        this.$submitBtn.find('[submit-btn="inner-text"]').hide();
        // this.$submitBtn.removeClass("next-btn").addClass(animationClassForBtn);
        this.$submitBtn.find(".lottie-loading").fadeIn();

        this.$form.submit();
      }
    });
  }

  isValidToSubmit() {
    const currSlideInputs = $("[data-custom-validation]");

    const isValid =
      this.formValidator.testIfArrayOfInputsAreValidate(currSlideInputs);
    return isValid;
  }
}

new SobreForm($('[sobre-form="form"] form'));
