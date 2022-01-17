let lang = "EN";
let errorMsgIndex = 0;

// To validate Email
const validEmailRegex = RegExp(
  /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
);

const validLinkRegex = RegExp(
  /^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i
);

// [english translation, german translation]
const errorMsgs = {
  emailInvalid: [
    `Invalid Email`,
    `Ungültiges Format. Bitte 'example@mail.com' nutzen.`,
  ],
  emailEmpty: [`Email cannot be empty`, `Dies ist ein Pflichtfeld.`],
  numberIsToHigh: [
    `Number too long.`,
    `Zu viele Ziffern, bitte Anzahl reduzieren.`,
  ],
  numberIsToLow: [`Number too low`, `Zu wenig Ziffern.`],
  numberCannotBeEmpty: [
    `This is a required field.`,
    `Dies ist ein Pflichtfeld.`,
  ],
  nameCannotBeEmpty: [`This is a required field.`, `Dies ist ein Pflichtfeld.`],
  nameCannotBeLess: [`Too few characters.`, `Zu wenig Zeichen.`],
  nameCannotBeHigh: [
    `Too many characters.`,
    `Zu viele Zeichen, bitte Anzahl reduzieren.`,
  ],
  linkCannotBeEmpty: [`This is a required field.`, `Dies ist ein Pflichtfeld.`],
  linkIsInvalid: [
    `Invalid link. Please insert 'https://www...' link.`,
    `Ungültiger Link. Bitte 'https://www...' Link einfügen.`,
  ],
  linkIsHttps: [
    `Invalid link. Please insert 'https://www...' link.`,
    `Ungültiger Link. Bitte 'https://www...' Link einfügen.`,
  ],
  ddCannotBeEmpty: [
    `Please make a selection.`,
    `Bitte treffen sie eine Auswahl.`,
  ],
};

function getErrorMsg(type) {
  if (!type) return;
  return errorMsgs[type][errorMsgIndex];
}

function validateEmail(stringValue, isRequired) {
  let result = "";
  if (stringValue.length > 0 && validEmailRegex.test(stringValue)) {
    result = "";
  } else if (stringValue.length > 0 && !validEmailRegex.test(stringValue)) {
    result = getErrorMsg("emailInvalid");
  } else if (stringValue.length === 0 && isRequired) {
    result = getErrorMsg("emailEmpty");
  } else if (stringValue.length === 0 && !isRequired) {
    result = "";
  }
  return result;
}

function validateNumber(stringValue, validateValue, isRequired) {
  let result = "";
  validateValue = String(validateValue);
  const [min, max] = validateValue.split("-");
  let valueInNumer = Number(stringValue);
  if (
    max &&
    stringValue.length >= Number(min) &&
    stringValue.length <= Number(max) &&
    valueInNumer > 0
  ) {
    result = "";
  } else if (max && stringValue.length >= Number(max)) {
    result = getErrorMsg("numberIsToHigh");
  } else if (stringValue.length === 0 && !isRequired) {
    result = "";
  } else if (stringValue.length < Number(min)) {
    result = getErrorMsg("numberIsToLow");
  } else if (stringValue.length > 0 && Number(min) < 0) {
    result = getErrorMsg("numberIsToLow");
  } else if (stringValue.length >= Number(min) && valueInNumer > 0) {
    result = "";
  } else if (stringValue.length === 0 && isRequired) {
    result = getErrorMsg("numberCannotBeEmpty");
  }
  return result;
}

function validateName(stringValue, validateValue, isRequired) {
  let result = "";
  if (validateValue === true) return result;
  const [min, max] = validateValue.split("-");
  if (stringValue.length >= Number(min) && stringValue.length <= Number(max)) {
    result = "";
  } else if (stringValue.length === 0 && !isRequired) {
    result = "";
  } else if (stringValue.length === 0 && isRequired) {
    result = getErrorMsg("nameCannotBeEmpty");
  } else if (stringValue.length < Number(min)) {
    result = getErrorMsg("nameCannotBeLess");
  } else if (stringValue.length > Number(max)) {
    result = getErrorMsg("nameCannotBeHigh");
  }
  return result;
}

function validateLink(stringValue, validateValue, isRequired) {
  let result = "";
  const typesAllowed = validateValue.split("-");
  if (
    typesAllowed.includes("http") &&
    isLinkHttp(stringValue) &&
    validLinkRegex.test(stringValue)
  ) {
    result = "";
  } else if (
    typesAllowed.includes("https") &&
    isLinkHttps(stringValue) &&
    validLinkRegex.test(stringValue)
  ) {
    result = "";
  } else if (stringValue.length === 0 && isRequired) {
    result = getErrorMsg("linkCannotBeEmpty");
  } else if (stringValue.length === 0 && !isRequired) {
    result = "";
  } else if (stringValue.length > 0 && !validLinkRegex.test(stringValue)) {
    result = getErrorMsg("linkIsInvalid");
  } else if (
    (typesAllowed.includes("http") && !isLinkHttp(stringValue)) ||
    (typesAllowed.includes("https") && !isLinkHttps(stringValue))
  ) {
    result = getErrorMsg("linkIsHttps");
  }
  return result;
}

function validateDropDown(stringValue, isRequired) {
  let result = "";
  if (stringValue === "" && isRequired) {
    result = getErrorMsg("ddCannotBeEmpty");
  } else if (stringValue !== "" && isRequired) {
    result = "";
  } else if (stringValue === "" && !isRequired) {
    result = "";
  }
  return result;
}

function isLinkHttp(url) {
  return url.match(/^http:\/\//);
}

function isLinkHttps(url) {
  return url.match(/^https:\/\//);
}

export {
  validateDropDown,
  validateEmail,
  validateLink,
  validateNumber,
  validateName,
};
