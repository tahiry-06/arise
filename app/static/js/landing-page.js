const welcome = document.querySelector(".welcome");
const startButton = document.querySelector(".start-button button");
const signIn = document.querySelector(".sign-in");
const signUp = document.querySelector(".sign-up");

const engageChallenge = signIn.querySelector(".sign-in-button button[type=button]");
const continueChallenge = signUp.querySelector(".sign-up-button button[type=button]");

const alertMessage = document.querySelector(".alert-message");

startButton.addEventListener("click", (e) => {
  e.target.classList.add("hide-start-button");
  startButton.parentNode.style.marginBottom = "-60px";
  signIn.classList.remove("invisible-sign-in");
  welcome.classList.add("reposition-welcome");
  setTimeout(() => {
    startButton.parentNode.remove();
  }, 600);
});

engageChallenge.addEventListener("click", () => {
  signIn.classList.add("hide-sign-in");
  signUp.classList.remove("hide-sign-up");
  setTimeout(() => {
    signIn.querySelectorAll("input").forEach((inp) => {
      inp.value = "";
      inp.classList.remove("invalid-input");
    });
    signIn.querySelector(".si-error-message").classList.add("hide-si-error");
  }, 700);
});

continueChallenge.addEventListener("click", () => {
  signIn.classList.remove("hide-sign-in");
  signUp.classList.add("hide-sign-up");
});

if (window.message) {
  alertMessage.style.display = "block";
  alertMessage.textContent = window.message;
} else {
  alertMessage.style.display = "none";
}
