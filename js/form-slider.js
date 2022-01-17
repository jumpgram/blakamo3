import {
  validateEmail,
  validateName,
  validateNumber,
  validateDropDown,
} from "./validations.js";

function convertToSlug(Text) {
  return Text.toLowerCase()
    .replace(/[^\w ]+/g, "")
    .replace(/ +/g, "-");
}

class FormValidation {
  constructor(form) {
    this.$form = $(form);
    this.formErrors = {};
    this.init();
  }

  init() {
    this.addEventsToCustomValidationInputs(this.$form);
  }

  addEventsToCustomValidationInputs() {
    this.$form.find("[data-custom-validation]").each((idx, ele) => {
      this.addInputChangeEL(ele);
    });
  }

  addInputChangeEL(inputEle) {
    if (!inputEle) return;
    $(inputEle).on("keyup change", (e) => this.checkForFormErrors(e));
    const inputDataName = $(inputEle).attr("name");
    let inputName = $(inputEle).data("dy-val");
    if (!inputName) {
      inputName = `${inputDataName + Math.floor(Math.random() * 10)}`;
      $(inputEle).attr("data-dy-val", convertToSlug(inputName));
    }
    if (!this.formErrors[inputName]) {
      this.formErrors[inputName] = {
        errorMsg: "",
      };
    }
  }

  testIfAllInputsAreValidate() {
    $(this.customValidationInputsArr()).each((idx, ele) => {
      this.checkForFormErrors(null, ele);
    });
  }

  testIfArrayOfInputsAreValidate(inputsArr) {
    const isValidArr = [...inputsArr]
      .map((ele) => {
        const isValid = this.checkForFormErrors(null, ele);
        return isValid;
      })
      .find((isValidEle) => isValidEle === false);

    return isValidArr === undefined ? true : false;
  }

  async handleSubmit(e) {
    this.testIfAllInputsAreValidate();
    this.validateFormHandler();
    // this.$submitBtn.text(this.pleaseWaitText);
    // this.$submitBtn.css({ cursor: "not-allowed" });

    if (this.validateForm(this.formErrors)) {
      this.$form.submit();
    } else {
      // this.$submitBtn.text(this.tryAgainText);
    }
  }

  getInputValidationType(domEle) {
    let typeOfValidation = {};
    if ($(domEle).data("validate-link")) {
      typeOfValidation["dataName"] = "link";
      typeOfValidation["dataValue"] = $(domEle).data("validate-link");
    } else if ($(domEle).data("validate-number")) {
      typeOfValidation["dataName"] = "number";
      typeOfValidation["dataValue"] = $(domEle).data("validate-number");
    } else if ($(domEle).data("validate-email")) {
      typeOfValidation["dataName"] = "email";
      typeOfValidation["dataValue"] = $(domEle).data("validate-email");
    } else if ($(domEle).data("validate-name")) {
      typeOfValidation["dataName"] = "name";
      typeOfValidation["dataValue"] = $(domEle).data("validate-name");
    } else if ($(domEle).data("validate-select")) {
      typeOfValidation["dataName"] = "select";
      typeOfValidation["dataValue"] = $(domEle).data("validate-select");
    }
    return typeOfValidation;
  }

  checkForFormErrors(e, ele) {
    let name;
    let value;
    let toValidateType;
    let toValidateTypeValue;
    let isRequired = false;

    // this.$submitBtn.text(this.btnDefaultText);

    if (ele) {
      name = $(ele).data("dy-val");
      value = $(ele).val();
      const { dataName, dataValue } = this.getInputValidationType(ele);
      toValidateType = dataName;
      toValidateTypeValue = dataValue;
      isRequired = $(ele).data("is-required");
    } else {
      name = $(e.target).data("dy-val");
      value = e.target.value;
      const { dataName, dataValue } = this.getInputValidationType(e.target);
      toValidateType = dataName;
      toValidateTypeValue = dataValue;
      isRequired = $(e.target).data("is-required");
    }

    if (!$(`[data-dy-val=${name}]`).attr("is-focused")) {
      $(`[data-dy-val=${name}]`).attr("is-focused", true);
    }

    let errors = { ...this.formErrors };
    switch (toValidateType) {
      case "email":
        errors[name] = validateEmail(value, isRequired);
        break;
      case "name":
        errors[name] = validateName(value, toValidateTypeValue, isRequired);
        break;
      case "link":
        errors[name] = validateLink(value, toValidateTypeValue, isRequired);
        break;
      case "number":
        errors[name] = validateNumber(value, toValidateTypeValue, isRequired);
        break;
      case "select":
        errors[name] = validateDropDown(value, isRequired);
        break;
      case "quill":
        errors[name] = validateEditor(value, toValidateTypeValue, isRequired);
        break;
      default:
        break;
    }
    this.updateFormErrors(errors);

    return errors[name].length > 0 ? false : true;
  }

  updateFormErrors(errors) {
    this.formErrors = { ...this.formErrors, ...errors };
    Object.keys(this.formErrors).forEach((echErr) => {
      const eleToSelect = this.getElementByDyVal(echErr);
      if (this.formErrors[echErr].length) {
        if ($(eleToSelect).attr("is-focused")) {
          // $(eleToSelect).addClass("error-state");
        }
        if ($(eleToSelect).siblings(".form-error-text").length > 0) {
          $(eleToSelect)
            .siblings(".form-error-text")
            .text(this.formErrors[echErr])
            .slideDown();
        } else {
          $(
            `<span class="form-error-text">${this.formErrors[echErr]}</span>`
          ).insertAfter($(eleToSelect));
        }

        $(eleToSelect)
          .parents('[form-slider="input-label-block"]')
          .addClass("on-error-msg");
      } else {
        if ($(eleToSelect).attr("is-focused")) {
          // $(eleToSelect).removeClass("error-state");
          $(eleToSelect)
            .parents('[form-slider="input-label-block"]')
            .removeClass("on-error-msg");
        }
        if ($(eleToSelect).siblings(".form-error-text")) {
          $(eleToSelect).siblings(".form-error-text").slideUp();
        }
      }
    });
  }

  getElementByDyVal(errorName) {
    let eleToReturn;
    $(this.$form)
      .find("[data-custom-validation]")
      .each(function () {
        if ($(this).data("dy-val") === errorName) {
          eleToReturn = $(this);
        }
      });
    return eleToReturn;
  }

  validateForm = (errors) => {
    let valid = true;
    Object.values(errors).forEach(
      // if we have an error string set valid to false
      (val) => val.length > 0 && (valid = false)
    );
    return valid;
  };

  validateFormHandler() {
    if (this.validateForm(this.formErrors)) {
      // this.$submitBtn.css("cursor", "pointer");
      // this.$submitBtn.find("*").css("cursor", "pointer");
    } else {
      // this.$submitBtn.css("cursor", "not-allowed");
      // this.$submitBtn.find("*").css("cursor", "not-allowed");
    }
  }

  customValidationInputsArr() {
    return this.$form.find("[data-custom-validation]");
  }
}

export { FormValidation };
