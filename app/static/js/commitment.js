const personalList = document.querySelectorAll(".daily .personal-lists ul li");
personalList.forEach((item) => {
  item.addEventListener("click", () => {
    makeEditable(item, "personal");
  });
});

const professionallList = document.querySelectorAll(".daily .professional-lists ul li");
professionallList.forEach((item) => {
  item.addEventListener("click", () => {
    makeEditable(item, "professional");
  });
});

const otherList = document.querySelectorAll(".daily .other-lists ul li");
otherList.forEach((item) => {
  item.addEventListener("click", () => {
    makeEditable(item, "other");
  });
});

function makeEditable(item, str) {
  const ancestor = item.closest(`.${str}`);
  if (!ancestor) {
    console.error(`Ancestor with class .${str} not found`);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.name = `${ancestor.className}-${[...item.parentNode.children].indexOf(item) + 1}`;
  textarea.maxLength = 36;
  textarea.value = item.textContent.trim();
  textarea.style.lineHeight = "1.1";

  const liHeight = item.getBoundingClientRect().height;

  // Replace item with textarea
  item.replaceWith(textarea);

  function adjustHeight() {
    textarea.style.height = "auto"; // Reset height
    const fontSize = parseFloat(window.getComputedStyle(textarea).fontSize); // e.g., 14px
    const minHeight = fontSize * 1.1; // ~15.4px for line-height: 1.1
    const isSingleLine = !textarea.value.includes("\n");
    // Use liHeight for single-line, else content height
    const finalHeight = isSingleLine ? Math.min(textarea.scrollHeight, liHeight) : textarea.scrollHeight;
    textarea.style.height = `${Math.max(minHeight, finalHeight)}px`;
  }
  // Initial height adjustment
  adjustHeight();

  textarea.focus();
  textarea.setSelectionRange(textarea.value.length, textarea.value.length);

  function saveChanges() {
    item.textContent = textarea.value || item.textContent;
    // textarea.replaceWith(item);
  }

  textarea.addEventListener("blur", saveChanges);

  textarea.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      textarea.removeEventListener("blur", saveChanges);
      saveChanges();
    }
  });

  textarea.addEventListener("input", adjustHeight);
}

const commitForm = document.querySelector("#commitments");

commitForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const formData = new FormData(commitForm);
  const values = {
    personal: [],
    professional: [],
    other: [],
  };

  // Fill values object with non-empty inputs
  for (let [name, value] of formData.entries()) {
    const [category, index] = name.split("-");
    if (value.trim() !== "" && values.hasOwnProperty(category)) {
      values[category].push(value.trim());
    }
  }

  // Validate: first input of each category must be filled
  const valid = values.personal[0] && values.professional[0] && values.other[0];

  if (valid) {
    saveCommitments(values);
  } else {
    console.error("Please fill at least the first commitment in each category.");
  }
});

async function saveCommitments(values) {
  const allRequests = [];

  for (let [key, arrayValues] of Object.entries(values)) {
    for (let item of arrayValues) {
      const request = fetch("/user/d/stickies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: item,
          category: key,
        }),
      }).then((response) => response.json());

      allRequests.push(request);
    }
  }

  try {
    const results = await Promise.all(allRequests);
    const redirectData = results.find((result) => result.redirectURL);

    if (redirectData?.redirectURL) {
      window.location.href = redirectData.redirectURL;
    } else {
      console.warn("No redirect URL found in the responses.");
    }
  } catch (error) {
    console.error("An error has occurred during the save process.", error);
  }
}
