export function validateStickyContent(sticky) {
  const pattern = /^[a-zA-Z0-9'" ,._-]+$/;
  return pattern.test(sticky) ? true : `Allowed characters are letters, digits and , ' " . - _`;
}

export async function validateSticky(element, func) {
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
