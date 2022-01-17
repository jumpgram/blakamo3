const formsOnPage = document.querySelectorAll("form");
const formParents = [];

formsOnPage.forEach(function (form) {
  formParents.push(form.parentElement);
  form.addEventListener("formSub", (e) => {
    window.location.href = "https://www.jumpgram.co/pages/schedule";
  });
});

const formSubEvt = new Event("formSub");

// Options for the observer (which mutations to observe)
const config = { attributes: true, childList: true, subtree: true };

const callback = function (mutationsList, observer) {
  for (const mutation of mutationsList) {
    if (
      mutation.type === "attributes" &&
      mutation.target.classList.contains("w-form-done")
    ) {
      const $form = mutation.target.parentElement.querySelector("form");
      const formData = new FormData($form);

      formSubEvt.formData = formData;
      $form.dispatchEvent(formSubEvt);
    }
  }
};

// Create an observer instance linked to the callback function
const observer = new MutationObserver(callback);

// Start observing the target node for configured mutations
formParents.forEach(function (form) {
  observer.observe(form, config);
});
