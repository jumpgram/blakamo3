let instaUsers = [];
const $modalInfo = $(".modal-info");
const serverUrl = "https://instagram-user-id.herokuapp.com";

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

function processCheckout(ele) {
  const instaUserName = $(ele).data("user-name");
  if (!instaUserName) return;
  let cbInstance, cart;

  cbInstance = Chargebee.init({
    site: "jump-gram",
    isItemsModel: true,
  });

  cbInstance.setCheckoutCallbacks(function (cart) {
    return {
      success: function (hpid) {
        console.log("success", hpid);
        window.location.href = `/terms-for-signup?username=${instaUserName}`;
      },
    };
  });

  cart = cbInstance.getCart();

  const planPriceId = "Jumpgram-Free-Plan-USD-Monthly"; // Plan price point ID is used to identify the product
  const planPriceQuantity = 1;
  const product = cbInstance.initializeProduct(planPriceId, planPriceQuantity);
  cart.replaceProduct(product);

  cart.setCustomer({ cf_instagram_username: instaUserName });
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

activateServer();
useFormValidation();
