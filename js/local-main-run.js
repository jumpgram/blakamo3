function loadJS(file) {
  if (!file) return;
  var jsElm = document.createElement("script");
  jsElm.type = "module";
  jsElm.src = file;
  document.body.appendChild(jsElm);
}

const url = new URL(window.location.href);
const isLocalRunning = url.searchParams.get("local");

if (isLocalRunning) {
  console.log("running code locally");
  loadJS("http://127.0.0.1:5502/dashboard/user.js");
} else {
  console.log("running code from Main");
  loadJS("https://jumpgram-code.s3.amazonaws.com/dashboard/user.js");
}
