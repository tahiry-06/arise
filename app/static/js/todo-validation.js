function validateTitle(title) {
  const pattern = /^[A-Za-z ]+$/;
  return pattern.test(title) ? true : "Name your challenge properly.";
}

function validateDescription(desc) {
  const pattern = /^[a-zA-Z0-9'" ,._-]+$/;
  return pattern.test(desc) ? true : `Allowed characters are letters, digits and , ' " . - _`;
}

function validateDate(date) {
  const chosen = new Date(date);
  const today = new Date();

  today.setHours(0, 0, 0, 0);
  chosen.setHours(0, 0, 0, 0);

  const difference = chosen - today;

  // if (
  //   chosen.getFullYear() === today.getFullYear() &&
  //   chosen.getMonth() === today.getMonth() &&
  //   chosen.getDate() === today.getDate()
  // ) {
  //   return "Is it today? write it on the daily stickies instead.";
  // }

  if (difference < 0) {
    return `Don't dwell on the past. Move on.`;
  }

  return true;
}

async function validateChallenge(element, func) {
  let isValid = false;
  if (func(element.value) === true) {
    isValid = true;
    // something else
  } else {
    isValid = func(element.value);
    // do something else
  }

  return () => isValid;
}

export async function todoValidation(form, name, description, dueDate) {
  const errorMessage = form.querySelector(".create-error") || form.querySelector(".edit-error");

  // validation
  const validTitle = await validateChallenge(name, validateTitle);
  const validDescription = await validateChallenge(description, validateDescription);
  const validDate = await validateChallenge(dueDate, validateDate);

  let isValid = true;

  // back-end stuffs
  // to-do: validate the form first
  // maybe we should have a function do it
  if (name.value == "" || description.value == "" || dueDate.value == "") {
    errorMessage.firstElementChild.classList.add("failure");
    errorMessage.firstElementChild.textContent = "All fields are mantatory.";

    isValid = false;
    return;
  }
  if (name.value && validTitle() !== true) {
    errorMessage.firstElementChild.classList.remove("success");
    errorMessage.firstElementChild.classList.add("failure");
    errorMessage.firstElementChild.textContent = `${validTitle()}`;
    isValid = false;
    return;
  }
  if (description.value && validDescription() !== true) {
    errorMessage.firstElementChild.classList.remove("success");
    errorMessage.firstElementChild.classList.add("failure");
    errorMessage.firstElementChild.textContent = `${validDescription()}`;
    isValid = false;
    return;
  }
  if (dueDate.value && validDate() !== true) {
    errorMessage.firstElementChild.classList.remove("success");
    errorMessage.firstElementChild.classList.add("failure");
    errorMessage.firstElementChild.textContent = `${validDate()}`;
    isValid = false;
    return;
  }

  return () => isValid;
}
