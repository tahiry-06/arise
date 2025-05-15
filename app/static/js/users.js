import { validateName, validateUsername, validateEmail, validatePassword, validate } from "./validation.js";

const signInForm = document.getElementById("sign-in");
const signUpForm = document.getElementById("sign-up");

signInForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  // reset the animation of the inputs on invalid
  signInForm.username.classList.remove("invalid-input");
  signInForm.password.classList.remove("invalid-input");

  const username = signInForm.username.value.trim();
  const password = signInForm.password.value.trim();

  // Verify from API
  try {
    const response = await fetch("/users/signin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      document.querySelector(".si-error-message .message").textContent = `${response.message}`;
      document.querySelector(".si-error-message").classList.remove("hide-si-error");
      return;
    }

    const data = await response.json();

    if (data.redirectURL) {
      localStorage.setItem("access_token_exp", data.exp * 1000);

      try {
        const sticky_response = await fetch(`${data.redirectURL}`, {
          method: "GET",
          credentials: "include",
        });

        const sticky_data = await sticky_response.json();
        if (sticky_data.redirectURL) {
          return (window.location.href = sticky_data.redirectURL);
        } else {
        }
      } catch (error) {
        console.error("sticky data retrieve error occured");
      }
    }

    switch (data.message) {
      // animate the inputs on invalid
      case "All fields are mandatory.":
        signInForm.username.classList.add("invalid-input");
        signInForm.password.classList.add("invalid-input");
        break;
      case "User not found.":
        signInForm.username.classList.add("invalid-input");
        signInForm.password.classList.remove("invalid-input");
        break;
      case "Incorrect password.":
        signInForm.username.classList.remove("invalid-input");
        signInForm.password.classList.add("invalid-input");
        break;
      default:
        console.log(data.message);
    }
    document.querySelector(".si-error-message .message").textContent = `${data.message}`;
    document.querySelector(".si-error-message").classList.remove("hide-si-error");
  } catch (error) {
    document.querySelector(".si-error-message .message").textContent = "Failed to connect to the server!";
    document.querySelector(".si-error-message").classList.remove("hide-si-error");
    console.log("Failed to connect to the server!");
  }
});

const name = signUpForm.name;
const username = signUpForm.username;
const email = signUpForm.email;
const password = signUpForm.password;

const validName = validate(name, validateName);
const validUsername = validate(username, validateUsername);
const validEmail = validate(email, validateEmail);
const validPassword = validate(password, validatePassword);

signUpForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (name.value.trim() && validName() !== true) {
    document.querySelector(".su-error-message .message").textContent = `${validName()}`;
    document.querySelector(".su-error-message").classList.remove("hide-su-error");
    return;
  }

  if (username.value.trim() && validUsername() !== true) {
    document.querySelector(".su-error-message .message").textContent = `${validUsername()}`;
    document.querySelector(".su-error-message").classList.remove("hide-su-error");
    return;
  }

  if (email.value.trim() && validEmail() !== true) {
    document.querySelector(".su-error-message .message").textContent = `${validEmail()}`;
    document.querySelector(".su-error-message").classList.remove("hide-su-error");
    return;
  }

  if (password.value.trim() && validPassword() !== true) {
    document.querySelector(".su-error-message .message").textContent = `${validPassword()}. Password is ${
      password.value
    }`;
    document.querySelector(".su-error-message").classList.remove("hide-su-error");
    return;
  }

  signUpForm.querySelectorAll("input").forEach((inp) => {
    inp.classList.remove("invalid-input");
  });

  // Verify from API
  try {
    const response = await fetch("/users/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name.value.trim(),
        username: username.value.trim(),
        email: email.value.trim(),
        password: password.value.trim(),
      }),
    });

    if (!response.ok) {
      document.querySelector(".su-error-message .message").textContent = `${response.message}`;
      document.querySelector(".su-error-message").classList.remove("hide-su-error");
      return;
    }

    const data = await response.json();
    if (data.redirectURL) {
      return (window.location.href = data.redirectURL);
    }

    switch (data.message) {
      case "All fields are mandatory.":
        signUpForm.querySelectorAll("input").forEach((inp) => {
          inp.value ? inp.classList.remove("invalid-input") : inp.classList.add("invalid-input");
        });
        break;
      case "Username already exists.":
        signUpForm.username.classList.add("invalid-input");
        signUpForm.querySelectorAll("input").forEach((inp) => {
          inp.name == "username" ? inp.classList.add("invalid-input") : inp.classList.remove("invalid-input");
        });
        break;
      default:
        console.log(data.message);
    }
    document.querySelector(".su-error-message .message").textContent = `${data.message}`;
    document.querySelector(".su-error-message").classList.remove("hide-su-error");
  } catch (error) {
    document.querySelector(".su-error-message .message").textContent = "Failed to connect to the server!";
    document.querySelector(".su-error-message").classList.remove("hide-su-error");
    console.log("Failed to connect to the server!");
  }
});
