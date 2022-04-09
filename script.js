//import { addGlobalEventListener, createElement, qs, qsa } from "./util.js";

let PermissionSetList = [];
let CheckCounter = 0;
let ActiveRow;
let ActiveCard;

const dialog = document.getElementById("permission-dialog");
const copyJson = document
  .getElementById("CopyJson")
  .addEventListener("click", () => {
    navigator.clipboard.writeText(jsonResult.innerHTML);
  });

const containers = document.querySelectorAll(".permission-drag-container"); //only one container
containers.forEach((container) => {
  container.addEventListener("dragover", (e) => {
    e.preventDefault();
    const afterElement = getDragAfterElement(container, e.clientY);
    const draggable = document.querySelector(".dragging");
    if (afterElement == null) {
      container.appendChild(draggable);
    } else {
      container.insertBefore(draggable, afterElement);
    }
  });
});

const span = document.getElementsByClassName("modal-close")[0];
const pmodal = document.getElementById("dialog-modal");
const modal = document.getElementById("roles-modal");
const jsonResult = document.getElementById("json-result");
const dialogOK = document
  .getElementById("SaveRoles")
  .addEventListener("click", (e) => {
    //clear filter
    table.search("").draw();
    setSelectedRoles();
    modal.classList.replace("show-modal", "hide-modal");
  });

const saveOK = document
  .getElementById("SavePermissions")
  .addEventListener("click", () => {
    savePermissions();
  });

span.onclick = function () {
  modal.classList.replace("show-modal", "hide-modal");
  table.search("").draw();
};

document.getElementById("hide").onclick = function () {
  pmodal.classList.replace("show-modal", "hide-modal");
};

document.getElementById("delete-card").onclick = function () {
  ActiveCard.closest(".permissions-container").remove();
  pmodal.classList.replace("show-modal", "hide-modal");
};

$("body").on("click", ".delete-card", function (e) {
  ActiveCard = e.target;
  pmodal.classList.replace("hide-modal", "show-modal");
});

$("body").on("click", ".fa-chevron-down", function (e) {
  e.target.classList.toggle("flip");
  e.target
    .closest(".permissions-container")
    .classList.toggle("permission-collapse");
  //pmodal.classList.replace("hide-modal", "show-modal");
});

function savePermissions() {
  PermissionSetList = [];
  const setlists = document.querySelectorAll(".permissions-container");

  setlists.forEach((setlist) => {
    let RoleList = [];

    let roleGroups = setlist.querySelectorAll(
      ".roles-group, .and-group .d-flex.flex-row"
    );

    roleGroups.forEach((roleGroup) => {
      let Roles = [];
      let roles = roleGroup.querySelectorAll("li.pill-holder");

      roles.forEach((role) => {
        Roles.push(role.dataset.role);
      });
      if (roles.length > 0) RoleList.push({ Roles: Roles });
    });

    if (RoleList.length > 0)
      PermissionSetList.push({
        IsAllow: setlist.querySelector(".permission-status").checked,
        RoleList,
      });
  });
  if (PermissionSetList.length > 0)
    jsonResult.innerHTML = JSON.stringify(PermissionSetList);
}

attachDynamicPermissions();
attachDynamicRoleListners();
attachDynamicGroupListners();

document.getElementById("new-permission").addEventListener("click", (e) => {
  //create div first so we can easilty access dom elements only inside the created div

  let elem = document.createElement("div");
  elem.classList.add(
    "draggable",
    "flex-content",
    "card",
    "shadow",
    "permissions-container"
  );
  elem.setAttribute("draggable", "true");
  elem.setAttribute("data-draggable", "false");
  elem.append(tmpl1.content.cloneNode(true));
  elem.querySelector(".permissions-container input[type='checkbox']").id =
    "chck" + CheckCounter;
  elem.querySelector(".check-trail").setAttribute("for", "chck" + CheckCounter);
  CheckCounter++;
  document.querySelector(".permission-drag-container").append(elem);
  attachDynamicPermissions();
  attachDynamicRoleListners();
  attachDynamicGroupListners();
});

function attachDynamicPermissions() {
  const draggables = document.querySelectorAll("[data-draggable='false']");
  const deleteButtons = document.querySelectorAll("[data-deletecard='false']");
  const groupButtons = document.querySelectorAll("[data-newgroup='false']");

  groupButtons.forEach((groupButton) => {
    groupButton.setAttribute("data-newgroup", "true");
    groupButton.addEventListener("click", (e) => {
      let target = e.target.closest(".permissions-container");
      target.querySelector(".and-group").append(tmpl2.content.cloneNode(true));
      attachDynamicRoleListners();
      attachDynamicGroupListners();
    });
  });

  draggables.forEach((draggable) => {
    draggable.setAttribute("data-draggable", "true");

    draggable.addEventListener("dragstart", (e) => {
      e.target.classList.add("dragging");
    });

    draggable.addEventListener("dragend", (e) => {
      e.target.classList.remove("dragging");
    });
  });
}

function setSelectedRoles() {
  document.querySelectorAll(".role-options.active").forEach(function (element) {
    element.classList.remove("active");
  });

  let selected = ActiveRow.target.closest(".flex-row");
  selected.querySelector(".role-options").classList.add("active");

  let selectedElements = document.querySelectorAll(
    "#roles-datatable input[type='checkbox']:checked"
  );

  for (let i = 0; i < selectedElements.length; i++) {
    if (
      selected.querySelectorAll("[data-role='" + selectedElements[i].id + "']")
        .length == 0
    ) {
      let li = document.createElement("li");
      let list = selected.querySelector(".role-options.active");
      let newNode = document.createElement("li");
      newNode.classList.add("or-operator");
      newNode.appendChild(document.createTextNode("or"));
      li.classList.add("pill-holder");
      li.setAttribute("data-role", selectedElements[i].id);
      li.appendChild(document.createTextNode(selectedElements[i].value));
      li.insertAdjacentHTML(
        "beforeend",
        "<i data-deleterole='false' class='fa fa-times' aria-hidden='true'></i>"
      );
      let selectedcount = selected.querySelectorAll(".pill-holder");
      if (selectedcount.length > 0)
        list.insertBefore(newNode, list.children[list.children.length - 1]);

      list.insertBefore(li, list.children[list.children.length - 1]);
      list = selected.querySelector(".role-options.active");
    }
  }
  attachDynamicRoleListners();
  document
    .querySelectorAll("#roles-datatable input[type='checkbox']:checked")
    .forEach((x) => {
      x.checked = false;
    });
}

function attachDynamicRoleListners() {
  const delButtons = document.querySelectorAll("[data-deleterole='false']");

  delButtons.forEach((delButton) => {
    delButton.setAttribute("data-deleterole", "true");
    delButton.addEventListener("click", (e) => {
      let prevElement = e.target.parentElement.previousElementSibling;
      let nextElement = e.target.parentElement.nextElementSibling;
      console.log(e.target.parentElement.previousElementSibling);
      e.target.parentElement.remove();
      if (prevElement?.classList.contains("or-operator")) {
        prevElement.remove();
      } else if (nextElement?.classList.contains("or-operator")) {
        nextElement.remove();
      }
    });
  });
}

function attachDynamicGroupListners() {
  const addButtons = document.querySelectorAll("[data-addrole='false']");
  const removeGroupButtons = document.querySelectorAll(
    "[data-removegroup='false']"
  );

  addButtons.forEach((addButton) => {
    addButton.setAttribute("data-addrole", "true");
    addButton.addEventListener("click", (e) => {
      ActiveRow = e;

      document
        .querySelectorAll("#roles-datatable input[type='checkbox']")
        .forEach((x) => {
          x.checked = false;
        });
      modal.classList.replace("hide-modal", "show-modal");
    });
  });

  removeGroupButtons.forEach((removeGroupButton) => {
    removeGroupButton.setAttribute("data-removegroup", "true");
    removeGroupButton.addEventListener("click", (e) => {
      let selectedElement = e.target.closest(".line-text");
      let nextElement = selectedElement.nextElementSibling;
      selectedElement.remove();
      nextElement.remove();
    });
  });
}

function getDragAfterElement(container, y) {
  const draggableElements = [
    ...container.querySelectorAll(".draggable:not(.dragging)"),
  ];

  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}
