import {
  getCurrentUserInfo,
  redirectUserToFSLogin,
  serverUrl,
  showMsg,
} from "./helpers.js";
import { updateUserData } from "./firestore-helpers.js";

function changeSite() {
  Chargebee.init({
    site: "jumpgram-test",
  });
  Chargebee.registerAgain();
}

changeSite();

let instaUsers = [];
const $modalInfo = $(".modal-info");

class HandleInstaModal {
  constructor(pk) {
    this.$passwordBlock = document.querySelector(
      "[insta-modal='password-block']"
    );

    this.$passwordInput = this.$passwordBlock.querySelector(
      "input[type='password']"
    );

    this.$passwordCheckBtn =
      this.$passwordBlock.querySelector("[insta-ps-btn]");

    this.pk = pk;

    this.$modalEle = document.querySelector(".instagram-modal");

    this.init();
  }

  init() {
    this.activateEvents();
  }

  activateEvents() {
    this.$passwordInput.addEventListener("keyup", (e) => {
      if (e.keyCode === 13) {
        this.verifyPassword();
      }
    });

    this.$passwordCheckBtn.addEventListener("click", () => {
      this.verifyPassword();
    });
  }

  async verifyPasswordApi(password) {
    try {
      if (!password) throw new Error("No password provided");
      if (!this.pk) throw new Error("Something went wrong, please try again");
      const url = `${serverUrl}/create-account`;
      const data = {
        pk: this.pk,
        password,
      };
      const res = await fetch(url, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const resJson = await res.json();

      if (resJson.success === true || resJson.user.status === "true") {
        showMsg("Account successfully connected", "success", this.$modalEle);
        this.hidePasswordBlock();
        return true;
      }
    } catch (error) {
      showMsg(error, "error", this.$modalEle);
      return false;
    }
  }

  verifyPassword() {
    const password = this.$passwordInput.value;
    if (password === "") {
      showMsg("Please enter a password", "error", this.$modalEle);
    } else {
      showMsg("Verifying password...", "info", this.$modalEle);
      this.verifyPasswordApi(password);
    }
  }

  showPasswordBlock() {
    this.$passwordBlock.style.display = "block";
  }

  hidePasswordBlock() {
    this.$passwordBlock.style.display = "none";
  }
}

// class handleCheckOutModal

async function getInstaUsersByUserName(username) {
  if (!username) return;
  try {
    const resData = await fetch(`${serverUrl}/insta/users/${username}`);
    const { usersProfileArr } = await resData.json();
    return usersProfileArr;
  } catch (error) {
    console.log({ error });
  }
}

async function activateServer() {
  console.log("activating");
  try {
    const resData = await fetch(serverUrl);
    const data = await resData.json();
    return data;
  } catch (error) {
    console.log({ error });
  }
}

function showInstaProfiles() {
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
  initInstaCardSelectEL();
}

function showModalInfo(text) {
  $($modalInfo).slideDown();
  $($modalInfo).text(text);
}

function hideModalInfo() {
  $($modalInfo).slideUp();
}

function initInstaCardSelectEL() {
  $('[data-insta-get="true"]').click(function () {
    processCheckout(this);
  });
}

async function updateUserDataInFirebase(data) {
  if (!data) return;
  const user = getCurrentUserInfo();
  if (user) {
    await updateUserData(user.uid, data);
    console.log("user data updated");
  }
}

async function activateUserAccInFS(pk, username) {
  try {
    if (!pk || !username)
      throw new Error("Something went wrong, please try again");

    const res = await fetch(`${serverUrl}/activate-account`, {
      method: "POST",
      body: JSON.stringify({
        pk,
        username,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const resJson = await res.json();

    console.log({ resJson });

    if (resJson.success === true) {
      return resJson?.user?.token;
    }
  } catch (error) {}
}

function processCheckout(ele) {
  const instaUserName = $(ele).data("user-name");
  const instaUserPk = $(ele).data("user-pk");
  const cbInstance = Chargebee.getInstance();

  cbInstance.setCheckoutCallbacks(function (cart) {
    // you can define a custom callbacks based on cart object
    return {
      loaded: function () {
        console.log("checkout opened");
      },
      close: function () {
        console.log("checkout closed");
      },
      success: async function (hostedPageId) {
        console.log("checkout success");
        cbInstance.closeAll();
        document.querySelector(".loading-sec").style.display = "flex";

        const token = await activateUserAccInFS(instaUserPk, instaUserName);

        await updateUserDataInFirebase({
          token,
          insta_connected: true,
          username: instaUserName,
          pk: instaUserPk,
        });

        redirectUserToFSLogin(token);
      },
      step: function (value) {
        // value -> which step in checkout
        console.log(value);
      },
    };
  });

  const cart = cbInstance.getCart();

  // const planPriceId = "jumpgram-influencer-primary"; // Plan price point ID is used to identify the product
  const planPriceId = "gramlilly-influencer"; // Plan price point ID is used to identify the product

  const planPriceQuantity = 1;
  const product = cbInstance.initializeProduct(planPriceId, planPriceQuantity);
  cart.replaceProduct(product);

  const userData = getCurrentUserInfo();
  console.log({ userData }, userData.email);
  const dataToFill = {};

  if (userData) {
    dataToFill.first_name = userData.first_name;
    dataToFill.last_name = userData.last_name;
    dataToFill.email = userData.email;
    dataToFill.phone = userData.phone;
    dataToFill.cf_uid = userData.uid;
  }

  cart.setCustomer({
    cf_instragram_username: instaUserName,
    ...dataToFill,
  });

  console.log({ instaUserName, dataToFill });
  cart.proceedToCheckout();
}

function useFormValidation() {
  const $submitBtn = $("[data-submit-btn]");
  const $form = $submitBtn.parents("form");
  const $name = $($form).find("[data-insta-username]");
  const nameInputName = $($name).attr("name");
  let formErrors = { [nameInputName]: "" };

  //activate event listeners
  $($name).on("change keyup", function () {
    $($submitBtn).attr("disabled", "false");
    $($submitBtn).css("cursor", "pointer");
  });

  $($form).submit(function (e) {
    e.preventDefault();
    handleSubmit();
    return false;
  });

  $($submitBtn).click(handleSubmit);

  async function handleSubmit() {
    $($submitBtn).text("Please Wait");
    checkForFormErrors(null, $name);
    validateFormHandler();
    console.log({ formErrors });
    if (validateForm(formErrors)) {
      showModalInfo("Please wait while we fetch profiles...");
      const inputValue = $($name).val();
      const usersArr = await getInstaUsersByUserName(inputValue);
      instaUsers = [...usersArr];
      showInstaProfiles();
      $($submitBtn).text("Search");
    } else {
      $($submitBtn).text("Try Again");
    }
  }

  const validateForm = (errors) => {
    let valid = true;
    Object.values(errors).forEach(
      // if we have an error string set valid to false
      (val) => val.length > 0 && (valid = false)
    );
    return valid;
  };

  function validateFormHandler() {
    if (validateForm(formErrors)) {
      $($submitBtn).attr("disabled", "false");
      $($submitBtn).css("cursor", "pointer");
    } else {
      $($submitBtn).attr("disabled", "true");
      $($submitBtn).css("cursor", "not-allowed");
    }
  }

  function updateFormErrors(errors) {
    formErrors = { ...formErrors, ...errors };
    Object.keys(formErrors).forEach((echErr) => {
      if (formErrors[echErr].length) {
        if ($(`[name=${echErr}]`).siblings(".input-error-msg").length > 0) {
          $(`[name=${echErr}]`)
            .siblings(".input-error-msg")
            .text(formErrors[echErr])
            .slideDown();
        } else {
          $(
            `<span class="input-error-msg">${formErrors[echErr]}</span>`
          ).insertAfter($(`[name=${echErr}]`));
        }
      } else {
        if ($(`[name=${echErr}]`).siblings(".input-error-msg")) {
          $(`[name=${echErr}]`).siblings(".input-error-msg").slideUp();
        }
      }
    });
  }

  function checkForFormErrors(e, ele) {
    let name;
    let value;
    if (ele) {
      name = $(ele).attr("name");
      value = $(ele).val();
    } else {
      name = e.target.name;
      value = e.target.value;
    }
    let errors = { ...formErrors };
    switch (name) {
      case nameInputName:
        errors[nameInputName] =
          value.length === 0
            ? "UserName cannot be empty"
            : value.length >= 2
            ? ""
            : "UserName should atleast have 2 letters";
        break;
      default:
        break;
    }
    updateFormErrors(errors);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  activateServer();
  useFormValidation();
});
