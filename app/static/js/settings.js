import { validateName, validateUsername, validateEmail, validatePassword, validate } from "./validation.js";

import { renderView } from "./app.js";

// const field = document.querySelector('input[name="name-edit"]');
// const validName = validate();

export async function validateEditInfo(field) {
  // console.log(fields);
  // fields.forEach((field) => {
  if (field.name === "name-edit") {
    const validName = validate(field, validateName);
    // console.log("EDITED");
    return validName;
  }
  if (field.name === "username-edit") {
    const validUsername = validate(field, validateUsername);
    // console.log("EDITED");
    return validUsername;
  }
  if (field.name === "email-edit") {
    const validEmail = validate(field, validateEmail);
    // console.log("EDITED");
    return validEmail;
  }
  // });
}

export async function hideEditPassword() {
  const pwdParentInjection = document.querySelector("#account .setting-pwd-form");
  const form = pwdParentInjection.querySelector("form#form-password-edit");
  const btns = pwdParentInjection.querySelectorAll("button");

  let isOkay;

  const validPwd = await passwordValidation(form);

  btns.forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      if (btn.getAttribute("type") == "submit") {
        e.preventDefault();
        // console.log("PASSWORD SAVED");
        // console.log(validPwd());
        // add the validation logic here
        isOkay = await verifyPwdFromAPI(form, validPwd);
        // console.log(isOkay);
        // this will be only executed if the datas are okay...

        if (isOkay) {
          createChangePwdBtn(pwdParentInjection);
          return;
        }
      } else {
        createChangePwdBtn(pwdParentInjection);
      }
    });
  });
}

function createChangePwdBtn(parent) {
  const changeBtn = document.createElement("button");
  changeBtn.setAttribute("type", "button");
  changeBtn.textContent = "change password.";
  changeBtn.addEventListener("click", async () => {
    // console.log("CHANGE PASSWORD");
    await renderView("settings-modal", parent);
    hideEditPassword();
  });

  parent.innerHTML = "";
  parent.appendChild(changeBtn);
}

async function verifyPwdFromAPI(form, isValid) {
  const oldPwd = form.old.value.trim();
  const newPwd = form.new.value.trim();
  const confirmPwd = form.confirm.value.trim();

  // console.log(oldPwd, newPwd, confirmPwd);
  // check if password is okay then update
  if (isValid() == true) {
    try {
      // first validate charachters of new password

      // validate new and confirm password
      if (newPwd !== confirmPwd) {
        console.error("New password is not matching");
        return false;
      }

      const response = await fetch(`/edit/${window.userData.id}`, {
        method: "PUT",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          // should be only one field here
          password: oldPwd,
          new_password: newPwd,
        }),
      });

      const data = await response.json();
      // console.log(data);
      // retrieveUserData(data.user);
      if (data.password_match == false) {
        return false;
      }

      return true;
    } catch (error) {
      console.error("An error occured,", error);
    }
  } else {
    return isValid();
  }
}

async function passwordValidation(form) {
  const validPassword = validate(form.new, validatePassword);
  return validPassword;
}
