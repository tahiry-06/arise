import {
  createChallenge,
  remainingDays,
  showModal,
  closeModal,
  closeEditModal,
  updateSummary,
  makeEditable,
} from "./dashboard.js";

import { validateEditInfo, hideEditPassword } from "./settings.js";
import { todoValidation } from "./todo-validation.js";

const root = document.getElementById("root");
const modals = document.getElementById("modals");

// buttons
const dashboardBtn = document.querySelector(".btn-dashboard");
const settingsdBtn = document.querySelector(".btn-settings");
const logoutdBtn = document.querySelector(".btn-logout");

// refresh acces token
const expiresIn = Number(localStorage.getItem("access_token_exp")) - Date.now();
const buffer = 2000;
const timeout = Math.max(expiresIn - buffer, 0);

// default page
// this need to be called only after the user enter one task for each sticky as commitement
dashboardPage();

// attach the event to the navigation buttons
dashboardBtn.addEventListener("click", () => dashboardPage());
settingsdBtn.addEventListener("click", () => settingPage());
logoutdBtn.addEventListener("click", () => logoutRequest());

// async create a render view for the fragments
export async function renderView(view, container = root) {
  container.innerHTML = await (await fetch(`../static/fragments/${view}.html`)).text();
}

// load pages the default view (dashboard)
async function dashboardPage() {
  showLoader();

  // create the dashboard css for the dashboard page
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "../static/css/dashboard.css";

  // added this for the FOUC
  const cssLoaded = new Promise((resolve, reject) => {
    link.onload = resolve; // ✅ Trigger when CSS has finished loading
    link.onerror = reject; // ✅ Catch if the file fails to load
  });

  document.head.insertBefore(link, document.head.lastElementChild);

  // remove the setting css
  const settingLinks = document.querySelectorAll('link[href="../static/css/settings.css"]');

  settingLinks.forEach((settingLink) => {
    if (settingLink) {
      settingLink.remove();
      // console.log("settings.css has been removed.");
    } else {
      console.error("settings.css is not loaded.");
    }
  });

  try {
    // added this too for the loader
    await cssLoaded;

    await renderView("dashboard");
    await renderView("dashboard-modal", modals);

    // changing the datas
    const usernamePlaceholder = document.querySelector(".user-name");
    usernamePlaceholder.textContent = `${window.userData.name}.`;

    // retrieve the challenges
    const todos = document.querySelector(".todos");
    retrieveStickies(todos);
    retrieveTodos(todos);

    // reattach events
    dashboardEvents();
    removeLoader();
  } catch (error) {
    console.error("Error initializing app:", error);
  }
}
async function retrieveTodos(todos) {
  try {
    const response = await fetch("/user/todos", {
      method: "GET",
      credentials: "include",
    });

    const data = await response.json();

    data.todo.forEach((item) => {
      const daysLeft = remainingDays(item.due_date);
      const todo = createChallenge(
        item.title,
        item.content,
        item.urgency,
        item.category,
        daysLeft,
        item._id,
        item.due_date,
        item.completed
      );
      todos.appendChild(todo);
    });
    updateSummary(data);
    // remove loader
    removeLoader();

    // console.log("Last active date:", data.user.last_active_date, "\nStreak count:", data.user.streak_count);
  } catch (error) {
    console.error("An error occured:", error);
  }
}
async function retrieveStickies(todos) {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const response = await fetch(`/user/d/stickies?timezone=${timezone}`, {
      method: "GET",
      credentials: "include",
    });

    const data = await response.json();
    // console.log(data, data.stickies.length);
    if (data.stickies.length == 0) {
      window.location.href = data.redirectURL;
    }
    // populate the stickies with the datas
    fillDailyStickies(data.stickies);
    // console.log(data);
    updateStreak(data.user.streak_count);
    //
    //
  } catch (error) {
    console.error("An error occured:", error);
  }
}
async function settingPage() {
  showLoader();

  // create the css link for settings page
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "../static/css/settings.css";

  // added this for the FOUC
  const cssLoaded = new Promise((resolve, reject) => {
    link.onload = resolve; // ✅ Trigger when CSS has finished loading
    link.onerror = reject; // ✅ Catch if the file fails to load
  });

  document.head.insertBefore(link, document.head.lastElementChild);

  // remove dashboard link
  const dashboardLinks = document.querySelectorAll('link[href="../static/css/dashboard.css"]');
  dashboardLinks.forEach((dashboardLink) => {
    if (dashboardLink) {
      dashboardLink.remove();
      // console.log("settings.css has been removed.");
    } else {
      console.error("settings.css is not loaded.");
    }
  });

  // remove modals
  modals.innerHTML = "";

  try {
    // added this too for the loader
    await cssLoaded;

    await renderView("settings");

    settingEvents();
    removeLoader();
  } catch (error) {
    console.error("Error rendering setting:", error);
  }
}

// remove loader and display main
// added this inside the retrieveTodos at the very bottom
function removeLoader() {
  document.querySelector(".main").style.display = "block";
  document.querySelector(".loader").style.display = "none";
}

function showLoader() {
  document.querySelector(".main").style.display = "none";
  document.querySelector(".loader").style.display = "block";
}
// create a function to reattach all dashboard events
function dashboardEvents() {
  // listen for form submission
  const forms = document.querySelectorAll(".create-challenge form");
  const editForm = document.querySelector("#edit-challenge");
  const todos = document.querySelector(".todos");

  const createMin = document.querySelector(".create-min-btn button");
  const closeBtnModal = document.querySelector('.create-btn button[type="button"]');
  const createModalBackdrop = document.querySelector(".create-modal-backdrop");

  const closeEditBtnModal = document.querySelector('.edit-btn button[type="button"]');
  const editModalBackdrop = document.querySelector(".edit-modal-backdrop");

  forms.forEach((form) => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const { name, description, urge, category } = form;
      const dueDate = form["due-date"];
      // const daysLeft = remainingDays(dueDate.value);

      // input validation
      // validation should return a boolean and ...
      const isValid = await todoValidation(form, name, description, dueDate);
      // console.log(typeof isValid, isValid());

      // ... send the datas to the back-end if the boolean from validation is true
      if (isValid) {
        try {
          const response = await fetch("/user/todos", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: name.value,
              description: description.value,
              urge: urge.checked,
              category: category.value,
              due_date: dueDate.value,
            }),
          });

          const data = await response.json();

          const errorMessage = form.querySelector(".create-error");

          errorMessage.firstElementChild.classList.remove("failure");
          errorMessage.firstElementChild.classList.add("success");
          errorMessage.firstElementChild.textContent = `${data.message}`;

          // console.log(data);

          // those should be inside a separate function
          // create new todo element
          const daysLeft = remainingDays(data.todo.due_date);
          const todo = createChallenge(
            data.todo.title,
            data.todo.content,
            data.todo.urgency,
            data.todo.category,
            daysLeft,
            data.todo._id,
            data.todo.due_date,
            data.todo.completed
          );

          // console.log(data.todo);
          todos.appendChild(todo);

          updateSummary(data);
        } catch (error) {
          console.error("An error occured:", error);
        }

        // if valid send it to the back end

        // reset form fields
        form.name.value = "";
        form.description.value = "";
        form.urge.checked = false;
        form.category.value = "";
        form["due-date"].value = "";

        // close modal if the form is from modal
        if (form.id === "create-challenge-modal") {
          closeModal();
        }
      } else {
        // keep field value if not valid
        form.name.value = name.value;
        form.description.value = description.value;
        form.urge.checked = urge.checked;
        form.category.value = category.value;
        form["due-date"].value = form["due-date"].value;
      }
    });
  });

  editForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorMessage = editForm.querySelector(".edit-error");

    const { name, description, urge, category } = editForm;
    const dueDate = editForm["due-date"];
    // const daysLeft = remainingDays(dueDate.value);

    const isValid = await todoValidation(editForm, name, description, dueDate);

    const submitBtn = editForm.querySelector(`button[type='submit']`);
    const todoId = submitBtn.dataset.id;
    // console.log(todoId);

    // data for realtime update the UI

    if (isValid) {
      try {
        const response = await fetch(`/user/edit-todo/${todoId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: name.value,
            content: description.value,
            urgency: urge.checked,
            category: category.value,
            due_date: dueDate.value,
          }),
        });

        const data = await response.json();
        const daysLeft = remainingDays(data.todo.due_date);
        // console.log(data);

        // real time update the UI
        const todo = document.querySelector(`[data-id='${todoId}']`).closest(".todo-wrapper");
        const markUrgent = todo.querySelector(".todo-menu p.urgent-mark");
        const days = todo.querySelector(".days-left");

        // console.log(todo);
        todo.querySelector(".todo-title").textContent = data.todo.title;

        todo.querySelector(".todo-hidden p").textContent = data.todo.content;

        if (data.todo.urgency) {
          markUrgent.textContent = "urgent.";
          markUrgent.className = "urgent-mark urgent";
          todo.querySelector(".days-urge").className = "days-urge small-urgent";
        } else {
          markUrgent.textContent = "not urgent.";
          markUrgent.className = "urgent-mark not-urgent";
          todo.querySelector(".days-urge").className = "days-urge small-not-urgent";
        }

        if (daysLeft < 0) {
          days.className = "days-left overdue";
          days.textContent = "overdue";
        } else if (daysLeft == 0) {
          days.textContent = "due today";
        } else if (daysLeft == 1) {
          days.textContent = "1 day left";
        } else {
          days.textContent = `${daysLeft} days left`;
        }

        errorMessage.firstElementChild.classList.remove("failure");
        errorMessage.firstElementChild.classList.add("success");
        errorMessage.firstElementChild.textContent = "Successfully edited.";
        updateSummary(data);
        closeEditModal();
        // reset form fields
        editForm.name.value = "";
        editForm.description.value = "";
        editForm.urge.checked = false;
        editForm.category.value = "";
        editForm["due-date"].value = "";
      } catch (error) {
        errorMessage.firstElementChild.classList.remove("success");
        errorMessage.firstElementChild.classList.add("failure");
        errorMessage.firstElementChild.textContent = error;
      }
    }
  });

  createMin.addEventListener("click", () => {
    showModal();
  });

  createModalBackdrop.addEventListener("click", () => {
    closeModal();
  });

  closeBtnModal.addEventListener("click", () => {
    closeModal();
  });

  editModalBackdrop.addEventListener("click", () => {
    closeEditModal();
  });

  closeEditBtnModal.addEventListener("click", () => {
    closeEditModal();
  });

  // lock the stickies
  const locks = document.querySelectorAll(".sticky button");
  locks.forEach((lock) => {
    lock.addEventListener("click", () => {
      if (lock.closest("div").nextElementSibling.classList.contains("locked")) {
        lock.closest("div").nextElementSibling.classList.remove("locked");
        lock.firstElementChild.textContent = "lock-open";
      } else {
        lock.closest("div").nextElementSibling.classList.add("locked");
        lock.firstElementChild.textContent = "lock";
      }
    });
  });

  const setupEditableList = (selector, category) => {
    const list = document.querySelector(selector);
    if (!list) return;

    // event delegation
    list.addEventListener("click", async (e) => {
      const button = e.target.closest("button");
      if (button) {
        // console.log("Check clicked for:", button.dataset.id);
        // Toggle check style or trigger logic here

        const stickyId = button.dataset.id;
        // console.log(stickyId);

        try {
          const response = await fetch(`/user/d/sticky-done/${stickyId}`, {
            method: "PUT",
            headers: {
              "Content-type": "application/json",
            },
            body: {},
          });

          const data = await response.json();
          // console.log(data);
          updateStreak(data.streak);

          if (data.sticky.completed == true) {
            button.closest("li").classList.add("sticky-done");
          } else {
            button.closest("li").classList.remove("sticky-done");
          }
        } catch (error) {
          console.log("An error has occured,", error);
        }

        return;
      }

      const li = e.target.closest("li");
      if (li && list.contains(li)) {
        makeEditable(li, category);
      }
    });
  };

  setupEditableList(".daily-sticky .personal-lists ul", "personal");
  setupEditableList(".daily-sticky .professional-lists ul", "professional");
  setupEditableList(".daily-sticky .other-lists ul", "other");
}
function settingEvents() {
  const sidebarButtons = document.querySelectorAll(".side-bar-container button");
  const settings = document.querySelectorAll(".setting");

  // sidebarButtons[0].parentElement.classList.add("active");

  sidebarButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      sidebarButtons.forEach((sideBtn) => {
        sideBtn.parentElement.classList.remove("active");
      });
      btn.parentElement.classList.add("active");

      const parentClass = btn.parentElement.className.split(" ")[0];

      settings.forEach((stg) => {
        stg.classList.remove("show-setting");
      });
      document.getElementById(parentClass).classList.add("show-setting");
    });
  });

  // retrieve the userData
  // maybe not use window.userData because it is outdated until next token refresh
  // we have to retrieve
  retrieveUserData(window.userData);
  // console.log(window.userData);

  // edit field
  const fieldBtns = document.querySelectorAll("#account .detail button");
  const fields = document.querySelectorAll("#account .detail input");
  const pwdParentInjection = document.querySelector("#account .setting-pwd-form");
  const pwdBtn = pwdParentInjection.querySelector("button");
  let isValid;

  const delBtn = document.querySelector("#account .setting-delete .del-btn button");

  fieldBtns.forEach((btn) => {
    btn.addEventListener("click", async () => {
      btn.previousElementSibling.classList.add("edit");
      btn.previousElementSibling.focus();
      btn.previousElementSibling.previousElementSibling.classList.add("display-edit");
      btn.innerHTML = `<span>check</span>`;
      btn.disabled = true;
      // I have to validate the stuffs from here
      isValid = await validateEditInfo(btn.previousElementSibling);
    });
  });

  // I have to validate the stuffs from here
  // validateEditInfo(fields);

  fields.forEach((field) => {
    const closestParent = field.parentElement;
    const display = closestParent.querySelector("p");
    field.value = display.textContent;

    field.addEventListener("blur", () => {
      // if true there were some edit and it's valid
      // if false there were no change so we just skip that
      // console.log(isValid());

      if (isValid() == true) {
        // console.log("Edit is valid");
        // update
        editAccount(field);
      } else if (isValid() == false) {
        console.log("No edit was made");
      } else {
        console.log(isValid());
      }

      // validate the inputs first
      display.textContent = field.value;
      field.classList.remove("edit");
      field.previousElementSibling.classList.remove("display-edit");
      field.nextElementSibling.innerHTML = `<span>pen-line</span>`;
      field.nextElementSibling.disabled = false;
      // send it to the API and..
      // render according to response
    });
  });

  pwdBtn.addEventListener("click", async () => {
    // console.log("CHANGE PASSWORD");
    await renderView("settings-modal", pwdParentInjection);
    // make the validation here

    hideEditPassword();
  });

  delBtn.addEventListener("click", async () => {
    console.log("ACCOUNT DELETED", window.userData.id);
    // delete user logic in here
    // will I have to make it lockable and something like that?
    try {
      const response = await fetch(`/delete/${window.userData.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();
      console.log(data);
      if (data.redirectURL) {
        window.location.href = data.redirectURL;
      }
    } catch (error) {
      console.error("an error has occured,", error);
    }
  });
}

// refresh acces token
async function refreshAccessToken() {
  try {
    const response = await fetch("/token/refresh", {
      method: "POST",
      credentials: "include", // Sends refresh_token cookie
    });

    const access_token_exp = await response.json();
    localStorage.setItem("access_token_exp", access_token_exp.exp * 1000);
    const delay = access_token_exp.exp * 1000 - Date.now() - 2000;
    setTimeout(refreshAccessToken, delay);
    return true;
  } catch (e) {
    console.log("Refresh error:", e);
    setTimeout(refreshAccessToken, 60000);
    return false;
  }
}
setTimeout(refreshAccessToken, timeout);

// handle log out
async function logoutRequest() {
  try {
    const response = await fetch(`/logout/${window.userData.id}`, {
      method: "POST",
      credentials: "include",
    });
    const data = await response.json();
    if (data.redirectURL) {
      localStorage.removeItem("access_token_exp");
      return (window.location.href = data.redirectURL);
    }
  } catch (error) {
    console.error("An error occured: ", error);
  }
}

function fillDailyStickies(raw_data) {
  const grouped = raw_data.reduce((acc, item) => {
    const data = {};
    if (!acc[item.category]) acc[item.category] = [];
    data.content = item.content;
    data.id = item["_id"];
    data.completed = item.completed;
    acc[item.category].push(data);
    return acc;
  }, {});

  const stickies = document.querySelectorAll(".sticky");

  stickies.forEach((sticky) => {
    const categories = Object.keys(grouped);

    categories.forEach((category) => {
      const contents = grouped[category];
      const lists = sticky.querySelectorAll(`.${category}-lists ul li`);

      lists.forEach((li, idx) => {
        if (contents[idx]) {
          // console.log(contents[idx]);

          if (contents[idx]["completed"] == true) {
            li.classList.add("sticky-done");
          } else {
            li.classList.remove("sticky-done");
          }

          li.innerHTML = `<button type="button" data-id="${contents[idx].id}"><span>check</span></button>
    <div class="sticky-content">${contents[idx]["content"]}</div>`;
          li.setAttribute("data-id", contents[idx].id);
        } else {
          li.textContent = "";
        }
      });
    });
  });
}

function updateStreak(streakCount) {
  const maxBolts = 7;
  const container = document.querySelector(".bolts");
  const streakText = document.querySelector(".streak-text");

  // Clear existing bolts
  container.innerHTML = "";

  // Create up to 7 bolts
  for (let i = 0; i < maxBolts; i++) {
    const span = document.createElement("span");
    span.classList.add("bolt");
    if (i < streakCount) span.classList.add("ok");
    span.textContent = "bolt";
    container.appendChild(span);
  }

  // Update streak text (can be more than 7)
  streakText.textContent = `${streakCount}`;
}

function retrieveUserData(data) {
  const fields = document.querySelectorAll(".setting-main .informations .detail-field p.display");

  fields.forEach((field) => {
    if (field.classList.contains("name-display")) {
      field.textContent = data.name;
    } else if (field.classList.contains("username-display")) {
      field.textContent = data.username;
    } else if (field.classList.contains("email-display")) {
      field.textContent = data.email;
    }
  });
}

async function editAccount(field) {
  const userId = window.userData.id;

  let fieldName;

  if (field.name === "name-edit") {
    fieldName = "name";
  } else if (field.name === "username-edit") {
    fieldName = "username";
  } else if (field.name === "email-edit") {
    fieldName = "email";
  }

  try {
    const response = await fetch(`/edit/${userId}`, {
      method: "PUT",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        // should be only one field here
        [fieldName]: field.value.trim(),
      }),
    });

    const data = await response.json();
    console.log(data);
    retrieveUserData(data.user);
  } catch (error) {
    console.error("An error occured,", error);
  }
}
