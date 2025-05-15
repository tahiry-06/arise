import { validateStickyContent, validateSticky } from "./sticky-validation.js";

const mainContainer = document.querySelector(".main");

export function createChallenge(name, description, urge, category, daysLeft, todoId, dueDate, completed) {
  const todoWrapper = document.createElement("div");

  // start todo
  const todo = document.createElement("div");
  todo.classList.add("todo");

  const todoVisible = document.createElement("div");
  todoVisible.classList.add("todo-visible");

  // start todo-about
  const todoAbout = document.createElement("div");
  todoAbout.classList.add("todo-about");

  const checkButton = document.createElement("button");
  checkButton.setAttribute("type", "button");
  checkButton.innerHTML = `<span>check</span>`;

  const todoDescription = document.createElement("div");
  todoDescription.classList.add("todo-description");

  const todoDescriptionBtn = document.createElement("button");
  todoDescriptionBtn.setAttribute("type", "button");

  const todoTitle = document.createElement("p");
  todoTitle.classList.add("todo-title");
  todoTitle.innerHTML = name;

  todoDescriptionBtn.addEventListener("keydown", (e) => {
    const thisTodoTitle = todoDescriptionBtn.querySelector(".todo-title");
    if (e.key === "Enter") thisTodoTitle.click();
  });

  todoTitle.addEventListener("click", (e) => {
    const todo = e.target.closest(".todo");
    const content = todo.querySelector(".todo-hidden");
    content.classList.toggle("show-description");

    // closeOtherDescriptions(content);
  });

  todoDescriptionBtn.appendChild(todoTitle);

  const daysUrgeElement = document.createElement("div");
  daysUrgeElement.classList.add("days-urge");

  urge ? daysUrgeElement.classList.add("small-urgent") : daysUrgeElement.classList.add("small-not-urgent");

  // daysUrgeElement.innerHTML = `
  //     <span>circle-exclamation</span>
  //     <p class="days-left ${daysLeft < 0 ? "overdue" : ""}">${
  //   daysLeft === 0 ? "due today" : daysLeft < 0 ? "overdue" : daysLeft === 1 ? `1 day left` : `${daysLeft} days left`
  // }</p>`;

  todoDescription.appendChild(todoDescriptionBtn);
  todoDescription.appendChild(daysUrgeElement);

  todoAbout.appendChild(checkButton);
  todoAbout.appendChild(todoDescription);
  // end todo-about

  // start todo-menu
  const todoMenu = document.createElement("div");
  todoMenu.classList.add("todo-menu");

  const urgentDescription = document.createElement("p");
  urgentDescription.classList.add("urgent-mark");
  if (urge) {
    urgentDescription.textContent = "urgent.";
    urgentDescription.classList.add("urgent");
  } else {
    urgentDescription.textContent = "not urgent.";
    urgentDescription.classList.add("not-urgent");
  }

  const editBtn = document.createElement("button");
  editBtn.setAttribute("type", "button");
  editBtn.setAttribute("data-id", `${todoId}`);
  editBtn.innerHTML = `<span>pen-to-square</span>`;

  editBtn.addEventListener("click", async () => {
    showEditModal();
    // edit this later on
    // this is not dnamically populated after save...
    // ... now it does, update the message left
    try {
      const response = await fetch(`/user/edit-todo/${todoId}`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();
      // console.log(data);

      populateEdit(
        data.todo.title,
        data.todo.content,
        data.todo.urgency,
        data.todo.category,
        data.todo.due_date,
        todoId
      );
    } catch (error) {
      console.error("An error occured.", error);
    }
  });

  const xMarkBtn = document.createElement("button");
  xMarkBtn.setAttribute("type", "button");
  xMarkBtn.innerHTML = `<span class="xmark">xmark</span>`;

  xMarkBtn.addEventListener("click", (e) => {
    const wrapper = e.target.closest(".todo-wrapper");
    const toDo = wrapper.querySelector(".todo");
    const toDoDelBtn = wrapper.querySelector(".todo-del-btn");

    toDo.classList.toggle("slide-del");
    toDoDelBtn.classList.toggle("open-del");

    // closeOtherMenus(toDo);
  });

  todoMenu.appendChild(urgentDescription);
  todoMenu.appendChild(editBtn);
  todoMenu.appendChild(xMarkBtn);
  // end todo-menu

  // start mobile-menu
  const mobileMenu = document.createElement("div");
  mobileMenu.classList.add("mobile-menu");

  const todoMenuMobile = document.createElement("div");
  todoMenuMobile.classList.add("todo-menu-mobile");

  const menuEllipsis = document.createElement("div");
  menuEllipsis.classList.add("menu-ellipsis");

  const ellipsisBtn = document.createElement("button");
  ellipsisBtn.setAttribute("type", "button");
  ellipsisBtn.innerHTML = `<span>ellipsis-vertical</span>`;

  ellipsisBtn.addEventListener("click", (e) => {
    const wrapper = e.target.closest(".todo-wrapper");
    const toDo = wrapper.querySelector(".todo");
    const mobMen = wrapper.querySelector(".mob-menu-slide");

    mobMen.classList.toggle("open-mob-menu");
    toDo.classList.toggle("slide");
  });

  menuEllipsis.appendChild(ellipsisBtn);

  todoMenuMobile.appendChild(menuEllipsis);

  mobileMenu.appendChild(todoMenuMobile);
  // end mobile-menu

  // start todo-hidden
  const todoHidden = document.createElement("div");
  todoHidden.classList.add("todo-hidden");
  const content = document.createElement("p");
  content.textContent = description;
  todoHidden.appendChild(content);
  // end todo-hidden

  todoVisible.appendChild(todoAbout);
  todoVisible.appendChild(todoMenu);
  todoVisible.appendChild(mobileMenu);

  todo.appendChild(todoVisible);
  todo.appendChild(todoHidden);
  // end todo

  // start delete button
  const todoDelBtn = document.createElement("div");
  todoDelBtn.classList.add("todo-del-btn");

  const delBtn = document.createElement("button");
  delBtn.setAttribute("type", "button");
  delBtn.setAttribute("data-id", `${todoId}`);
  delBtn.textContent = "delete.";

  delBtn.addEventListener("click", async () => {
    try {
      const response = await fetch(`/user/delete-todo/${todoId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();
      if (response.ok) {
        const todoWrapper = delBtn.closest(".todo-wrapper");
        todoWrapper.classList.add("deleted");
        setTimeout(() => {
          todoWrapper.remove();
        }, 350);
        updateSummary(data);
      }
    } catch (error) {
      console.error("An error occured", error);
    }
  });

  todoDelBtn.appendChild(delBtn);
  // end delete button

  // start mob-menu-slide
  const mobMenuSlide = document.createElement("div");
  mobMenuSlide.classList.add("mob-menu-slide");

  const editMobBtn = document.createElement("button");
  editMobBtn.setAttribute("type", "button");
  editMobBtn.setAttribute("data-id", `${todoId}`);
  editMobBtn.innerHTML = `<span>pen-to-square</span>`;

  editMobBtn.addEventListener("click", async (e) => {
    showEditModal();
    // edit this populate later

    try {
      const response = await fetch(`/user/edit-todo/${todoId}`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      populateEdit(
        data.todo.title,
        data.todo.content,
        data.todo.urgency,
        data.todo.category,
        data.todo.due_date,
        todoId
      );
    } catch (error) {
      console.error("An error occured.", error);
    }
  });

  const delMobBtn = document.createElement("button");
  delMobBtn.setAttribute("type", "button");
  delMobBtn.setAttribute("data-id", `${todoId}`);
  delMobBtn.innerHTML = `<span>trash</span>`;

  delMobBtn.addEventListener("click", async () => {
    try {
      const response = await fetch(`/user/delete-todo/${todoId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();
      if (response.ok) {
        const todoWrapper = delBtn.closest(".todo-wrapper");
        todoWrapper.classList.add("deleted");
        setTimeout(() => {
          todoWrapper.remove();
        }, 350);
        updateSummary(data);
      }
    } catch (error) {
      console.error("An error occured", error);
    }
  });
  // default
  todoWrapper.classList.add("todo-wrapper");
  if (completed == true) {
    todoWrapper.classList.add("challenge-done");
    editBtn.tabIndex = -1;
    daysUrgeElement.innerHTML = `
      <span>circle-exclamation</span>
      <p class="days-left completed"}">--</p>`;
  } else {
    todoWrapper.classList.remove("challenge-done");
    editBtn.tabIndex = 0;
    if (daysLeft < 0) {
      todoWrapper.classList.add("challenge-overdue");
      checkButton.classList.add("btn-disabled");
      checkButton.tabIndex = -1;
    } else {
      checkButton.tabIndex = 0;
      checkButton.classList.remove("btn-disabled");
    }
    daysUrgeElement.innerHTML = `
      <span>circle-exclamation</span>
      <p class="days-left ${daysLeft < 0 ? "overdue" : ""}">${
      daysLeft === 0 ? "due today" : daysLeft < 0 ? "overdue" : daysLeft === 1 ? `1 day left` : `${daysLeft} days left`
    }</p>`;
  }

  // done button
  checkButton.addEventListener("click", async () => {
    // console.log("MARKED AS DONE", todoId);
    try {
      const response = await fetch(`/user/done-todo/${todoId}`, {
        method: "PUT",
        headers: {
          "Content-type": "application/json",
        },
        body: {},
      });

      const data = await response.json();
      if (data.todo.completed) {
        todoWrapper.classList.add("challenge-done");
        editBtn.tabIndex = -1;
        daysUrgeElement.innerHTML = `
      <span>circle-exclamation</span>
      <p class="days-left completed"}">--</p>`;
      } else {
        todoWrapper.classList.remove("challenge-done");
        editBtn.tabIndex = 0;
        daysUrgeElement.innerHTML = `
      <span>circle-exclamation</span>
      <p class="days-left ${daysLeft < 0 ? "overdue" : ""}">${
          daysLeft === 0
            ? "due today"
            : daysLeft < 0
            ? "overdue"
            : daysLeft === 1
            ? `1 day left`
            : `${daysLeft} days left`
        }</p>`;
      }

      updateSummary(data);
    } catch (error) {
      console.error("An error occured.", error);
    }
  });

  mobMenuSlide.appendChild(editMobBtn);
  mobMenuSlide.appendChild(delMobBtn);
  // end mob-menu-slide

  todoWrapper.appendChild(todo);
  todoWrapper.appendChild(todoDelBtn);
  todoWrapper.appendChild(mobMenuSlide);

  return todoWrapper;
}

export function remainingDays(dueDate) {
  const today = new Date();
  const date = new Date(dueDate);

  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil((date - today) / (1000 * 60 * 60 * 24));

  return diffDays;
}

export function showModal() {
  const createModal = document.querySelector(".modal .create-challenge");
  const createModalBackdrop = document.querySelector(".create-modal-backdrop");

  createModalBackdrop.style.zIndex = 1001;
  createModal.style.zIndex = 2000;

  setTimeout(() => {
    createModalBackdrop.classList.toggle("show-modal-backdrop");
    createModal.classList.toggle("show-modal");
    mainContainer.classList.toggle("blurred");
  }, 100);
}

export function closeModal() {
  const createModal = document.querySelector(".modal .create-challenge");
  const createModalBackdrop = document.querySelector(".create-modal-backdrop");

  createModal.classList.toggle("show-modal");
  setTimeout(() => {
    createModalBackdrop.style.zIndex = -1001;
    createModalBackdrop.classList.toggle("show-modal-backdrop");
    createModal.style.zIndex = -2000;
    mainContainer.classList.toggle("blurred");
  }, 100);
}

function showEditModal() {
  const editModal = document.querySelector(".edit-challenge");
  const editModalBackdrop = document.querySelector(".edit-modal-backdrop");

  const errorMessage = document.querySelector(".edit-error");

  errorMessage.firstElementChild.classList.remove("failure");
  errorMessage.firstElementChild.classList.remove("success");
  errorMessage.firstElementChild.textContent = "please be careful editing your challenge.";

  editModalBackdrop.style.zIndex = 1001;
  editModal.style.zIndex = 2000;

  setTimeout(() => {
    editModalBackdrop.classList.toggle("show-modal-backdrop");
    editModal.classList.toggle("show-modal");
    mainContainer.classList.toggle("blurred");
  }, 100);
}

export function closeEditModal() {
  const editModal = document.querySelector(".edit-challenge");
  const editModalBackdrop = document.querySelector(".edit-modal-backdrop");

  editModal.classList.toggle("show-modal");
  setTimeout(() => {
    editModalBackdrop.style.zIndex = -1001;
    editModalBackdrop.classList.toggle("show-modal-backdrop");
    editModal.style.zIndex = -2000;
    mainContainer.classList.toggle("blurred");
  }, 100);
}

function populateEdit(name, description, urge, category, dueDate, todoId) {
  const editForm = document.querySelector("form#edit-challenge");
  editForm.name.value = name;
  editForm.description.value = description;
  editForm.urge.checked = urge;
  editForm.category.value = category;
  editForm["due-date"].value = new Date(dueDate).toISOString().split("T")[0];

  const submitBtn = editForm.querySelector(`button[type='submit']`);
  submitBtn.setAttribute("data-id", todoId);
}

function closeOtherMenus(current) {
  document.querySelectorAll(".todo").forEach((item) => {
    if (item !== current) {
      item.classList.remove("slide-del");
      item.nextElementSibling.classList.remove("open-del");
    }
  });
}

function closeOtherMobileMenus(current) {
  document.querySelectorAll(".todo").forEach((item) => {
    if (item !== current) {
      item.classList.remove("slide");
      item.nextElementSibling.nextElementSibling.classList.remove("open-mob-menu");
    }
  });
}

function closeOtherDescriptions(current) {
  document.querySelectorAll(".todo-hidden").forEach((item) => {
    if (item !== current) {
      item.classList.remove("show-description");
    }
  });
}
// close the show and hide
document.querySelector("#root").addEventListener("click", (event) => {
  // console.log(event.target);
  const todo = event.target.closest(".todo");
  // for the delete on main
  if (event.target.classList.contains("xmark")) {
    closeOtherMenus(todo);
  } else {
    document.querySelectorAll(".todo").forEach((item) => {
      item.classList.remove("slide-del");
      item.nextElementSibling.classList.remove("open-del");
    });
  }
  // for the descriptions
  if (event.target.classList.contains("todo-title")) {
    const hiddenTodo = todo.querySelector(".todo-hidden");
    closeOtherDescriptions(hiddenTodo);
  } else {
    document.querySelectorAll(".todo-hidden").forEach((item) => {
      item.classList.remove("show-description");
    });
  }
  // for mobile menu
  if (event.target.textContent == "ellipsis-vertical") {
    closeOtherMobileMenus(todo);
  } else {
    document.querySelectorAll(".todo").forEach((item) => {
      item.classList.remove("slide");
      item.nextElementSibling.nextElementSibling.classList.remove("open-mob-menu");
    });
  }
});

export function updateSummary(data) {
  const total = document.querySelector(".challenge-summary .total");
  const achieved = document.querySelector(".challenge-summary .achieved");
  const inProgress = document.querySelector(".challenge-summary .in-progress");
  const important = document.querySelector(".challenge-summary .important");
  const overdue = document.querySelector(".challenge-summary .overdue");
  const challengeSummary = document.querySelector("section.challenge-summary");

  total.textContent = `/${data.about.count}`;
  achieved.textContent = `${data.about.completed}`;
  inProgress.textContent = `${data.about.in_progress}`;
  important.textContent = `${data.about.important}`;
  overdue.textContent = `${data.about.overdue}`;

  if (data.about.count == data.about.completed) {
    challengeSummary.classList.add("challenges-done");
  } else {
    challengeSummary.classList.remove("challenges-done");
  }

  // console.log(data);
}

export function makeEditable(item, str) {
  const ancestor = item.closest(`.${str}`);
  if (!ancestor) {
    console.error(`Ancestor with class .${str} not found`);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.name = `${ancestor.className}-${[...item.parentNode.children].indexOf(item) + 1}`;
  textarea.maxLength = 36;
  textarea.value = item.lastElementChild?.textContent.trim() ?? "";
  textarea.style.lineHeight = "1.1";
  textarea.dataset.id = item.dataset.id ? item.dataset.id : false;

  // console.log(typeof textarea.dataset.id);

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

  async function saveChanges() {
    textarea.value = textarea.value.trim();
    const stickyId = textarea.dataset.id;
    // console.log(stickyId, typeof stickyId);
    if (stickyId !== "false") {
      if (textarea.value.trim() == "") {
        updateAPI(stickyId, textarea, item);
      } else {
        const validSticky = await validateSticky(textarea, validateStickyContent);
        if (validSticky() === true && textarea.value != item.lastElementChild.textContent.trim()) {
          updateAPI(stickyId, textarea, item);
        } else {
          // console.error("DATA INVALID, CHECK AGAIN");
          updateUI(textarea, item);
        }
      }
      // console.log("WITH STICKY ID");
    } else {
      createAPI(textarea, item);
      // console.log("NO STICKY ID");
    }
  }

  async function updateAPI(stickyId, textarea, item) {
    try {
      const response = await fetch(`/user/d/edit-sticky/${stickyId}`, {
        method: "PUT",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          content: textarea.value.trim(),
        }),
      });

      const data = await response.json();
      // console.log(data);

      updateUIviaAPI(data, textarea, item);
      //
      //
    } catch (error) {
      console.error("An error occured,", error);
    }
  }

  async function createAPI(textarea, item) {
    const validSticky = await validateSticky(textarea, validateStickyContent);

    const category = textarea.closest("div").className.split("-")[0];
    // console.log(category);

    if (validSticky() === true) {
      try {
        const response = await fetch(`/user/d/stickies`, {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify({
            content: textarea.value.trim(),
            category: category,
          }),
        });

        const data = await response.json();
        // console.log(data);

        updateUIviaAPI(data, textarea, item);
        //
        //
      } catch (error) {
        console.error("An error occured,", error);
      }
    } else {
      // console.error("DATA INVALID, CHECK AGAIN");
      updateUI(textarea, item);
    }
  }

  function updateUI(textarea, item) {
    if (textarea.value != "") {
      item.innerHTML = `<button type="button" data-id="${textarea.dataset.id}"><span>check</span></button>
    <div class="sticky-content">${textarea.value}</div>`;
    } else {
      item.textContent = textarea.value;
    }
    textarea.replaceWith(item);
  }

  function updateUIviaAPI(data, textarea, item) {
    // item.textContent = data.sticky.content;
    // console.log(data);

    if (data.sticky.completed == true) {
      item.classList.add("sticky-done");
    } else {
      item.classList.remove("sticky-done");
    }

    item.innerHTML = `<button type="button" data-id="${data.sticky._id}"><span>check</span></button>
    <div class="sticky-content">${data.sticky.content}</div>`;
    textarea.replaceWith(item);
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
