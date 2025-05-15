export function validateName(name) {
  const pattern = /^[A-Za-z ]+$/;
  return pattern.test(name) ? true : "Name should not contain numbers.";
}

export function validateUsername(username) {
  const pattern = /^[a-zA-Z0-9._-]+$/;
  return pattern.test(username)
    ? true
    : "Username should only contain letters, digits ans special character(- or . or _).";
}

export function validateEmail(email) {
  const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return pattern.test(email) ? true : "Enter a valid email address.";
}

export function validatePassword(password) {
  const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.-])[A-Za-z\d@$!%*?&.-]{8,}$/;
  return pattern.test(password)
    ? true
    : "Password should be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.";
}

export function validate(element, func) {
  let isValid = false;
  element.addEventListener("input", () => {
    if (func(element.value) === true) {
      element.classList.remove("invalid-input");
      isValid = true;
    } else {
      element.classList.add("invalid-input");
      // console.log(func(element.value));
      isValid = func(element.value);
    }
    // console.log(element.value, isValid);
  });
  return () => isValid;
}
