// Initialize the audio file for operations
const Sound = new Audio("audio.wav");

// Event listener to load the UI when the page reloads
document.addEventListener("DOMContentLoaded", () => {
  getItems();
});

/* 
Basic Structure of our db object in local storage
*********************************************
db = {
  id: "id",
  todoText: 'text',
  status: 'completed'
}
*/

// Get the number of tasks in the local storage
function getTaskLength(db) {
  return db.length;
}

// Get the number of active tasks in the local storage
function getActiveTaskLength(db) {
  return db.filter(item => item.status === "active").length;
}

// Retrieve and render the todo list from local storage
function getItems() {
  let db = JSON.parse(localStorage.getItem("todoList")) || [];
  if (db.length > 0) {
    const activeItems = db.filter(item => item.status === "active");
    const completedItems = db.filter(item => item.status === "completed");

    generateItems(activeItems, "active");
    generateItems(completedItems, "completed");
  }
  updateTask(db);
}

// Generate and append todo items to the UI based on their status
function generateItems(items, status) {
  const todoContainer = document.querySelector("#todo-items");
  if (status === "active") {
    todoContainer.innerHTML = "";
  }
  items.forEach(item => {
    const todoItem = createTodoItem(item, status);
    if (status === "active") {
      todoContainer.insertBefore(todoItem, todoContainer.firstChild);
    } else {
      todoContainer.appendChild(todoItem);
    }
  });
}

// Create a todo item HTML element
function createTodoItem(item, status) {
  const todoItem = document.createElement("div");
  todoItem.dataset.itemId = item.id;
  todoItem.classList.add("todo-item");

  const left = document.createElement("div");
  left.classList.add("left");

  const check = document.createElement("div");
  check.classList.add("check");
  if (item.status === "completed") {
    check.classList.add("checked");
  }

  const checkMark = document.createElement("div");
  checkMark.classList.add("check-mark");
  if (item.status === "completed") {
    checkMark.classList.add("checked");
  }
  checkMark.addEventListener("click", toggleCheckClass);

  checkMark.innerHTML = '<i class="fa-solid fa-check"></i>';
  check.appendChild(checkMark);

  const todoTextElm = document.createElement("div");
  todoTextElm.classList.add("todo-text");
  if (item.status === "completed") {
    todoTextElm.classList.add("checked");
  }

  const todoInput = document.createElement("input");
  todoInput.classList.add("text");
  todoInput.type = "text";
  todoInput.value = item.todoText;
  todoInput.setAttribute("readonly", "readonly");

  todoTextElm.appendChild(todoInput);

  left.appendChild(check);
  left.appendChild(todoTextElm);

  const right = document.createElement("div");
  right.classList.add("right");

  const edit = document.createElement("div");
  edit.classList.add("edit");
  if (item.status === "completed") {
    edit.classList.add("hide");
  }
  edit.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>';
  edit.addEventListener("click", editTodo);

  const del = document.createElement("div");
  del.classList.add("del");
  del.innerHTML = '<i class="fa-solid fa-trash"></i>';
  del.addEventListener("click", removeTodo);

  right.appendChild(edit);
  right.appendChild(del);

  todoItem.appendChild(left);
  todoItem.appendChild(right);

  return todoItem;
}

// Update the task counts in the UI
function updateTask(db) {
  const totalTasks = getTaskLength(db);
  const activeTask = getActiveTaskLength(db);

  document.querySelector(".items-left").innerText = `Task (${totalTasks})`;
  document.querySelector(".activeT").innerText = `Active (${activeTask})`;
  document.querySelector(".completedT").innerText = `Completed (${totalTasks - activeTask})`;
}

// Remove all checked (completed) tasks
function removeChecked() {
  let db = JSON.parse(localStorage.getItem("todoList")) || [];
  db = db.filter(item => !document.querySelector(`[data-item-id="${item.id}"] .check-mark`).classList.contains("checked"));
  localStorage.setItem("todoList", JSON.stringify(db));
  getItems();
}

// Toggle the check status of a todo item
function toggleCheckClass(event) {
  const element = event.target.closest(".check-mark");
  element.classList.toggle("checked");
  Sound.play();

  const todoItem = element.closest(".todo-item");
  const todoText = todoItem.querySelector(".todo-text");
  todoText.classList.toggle("checked");

  const itemId = todoItem.dataset.itemId;
  let db = JSON.parse(localStorage.getItem("todoList")) || [];
  const itemIndex = db.findIndex(item => item.id === itemId);
  if (itemIndex !== -1) {
    db[itemIndex].status = db[itemIndex].status === "active" ? "completed" : "active";
    localStorage.setItem("todoList", JSON.stringify(db));
    getItems();
  }
}

// Remove a specific todo item
function removeTodo(event) {
  const delButton = event.target.closest(".del");
  let db = JSON.parse(localStorage.getItem("todoList")) || [];
  const todoItem = delButton.closest(".todo-item");
  const itemId = todoItem.dataset.itemId;
  db = db.filter(item => item.id !== itemId);
  localStorage.setItem("todoList", JSON.stringify(db));
  todoItem.remove();
  updateTask(db);
  Sound.play();
}

// Edit a specific todo item
function editTodo(event) {
  const editButton = event.target.closest(".edit");
  const todoItem = editButton.closest(".todo-item");
  const todoInput = todoItem.querySelector(".todo-text input");

  if (editButton.classList.contains("fa-pen-to-square")) {
    editButton.classList.replace("fa-pen-to-square", "fa-save");
    todoInput.removeAttribute("readonly");
    todoInput.focus();
  } else {
    editButton.classList.replace("fa-save", "fa-pen-to-square");
    todoInput.setAttribute("readonly", "readonly");

    const itemId = todoItem.dataset.itemId;
    let db = JSON.parse(localStorage.getItem("todoList")) || [];
    const itemIndex = db.findIndex(item => item.id === itemId);
    if (itemIndex !== -1) {
      db[itemIndex].todoText = todoInput.value;
      localStorage.setItem("todoList", JSON.stringify(db));
    }
  }
  Sound.play();
}

// Generate a random string of a given length for the todo ID
function generateRandomString(length) {
  const characters = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "todo";
  for (let i = 0; i < length - 4; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// Add a new todo item
function addItem(event) {
  event.preventDefault();
  Sound.play();

  let db = JSON.parse(localStorage.getItem("todoList")) || [];
  const textInput = document.querySelector("#todo-input");
  const newTodo = {
    todoText: textInput.value,
    status: "active",
    id: generateRandomString(10)
  };

  db.push(newTodo);
  localStorage.setItem("todoList", JSON.stringify(db));
  textInput.value = "";
  getItems();
}

// Initial rendering of the UI
getItems();
