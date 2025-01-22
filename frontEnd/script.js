// Get userId from URL
const urlParams = new URLSearchParams(window.location.search); // extract query params from page URL in an object
const userId = urlParams.get('userId'); // retrieves userId value from the url object above

if (userId) { //user hasnt logged in !
    alert('you forgot to login!');
    window.location.href = 'login.html';
}

// function to load the task whether it is a new task or one from the database
async function loadTasks(){
    // request the backend to retrieve to-do-list tasks for the user
    const response = await fetch(`http://localhost:3000/tasks/${userId}`);
    const tasksArr = await response.json(); // array of objects representing a task with properties

    // select the HTML elements with the ID 'taskList'  and clear
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = ''; // clear to avoid dupes

    // loop through each task in the tasksarray
    tasksArr.forEach((task) => {
        //create new <li> element and set the HTML content to
        const li = document.createElement('li');
        //display the task text inside a span ad add the delete button
        li.innerHTML = `
            <span>${task.task}</span>
            <button onclick="deleteTask(${task.id})">🗑</button>
        `;
        taskList.appendChild(li);
    });
}

// load tasks wonce the HTML structure is fully loaded first
document.addEventListener('DOMContentLoaded', loadTasks);

// when users want to click the addTaskie button to add a new task
document.getElementById('addTaskBtn').addEventListener('click', async () => {
    const taskInput = document.getElementById('taskInput');
    const taskText = taskInput.value.trim();
  
    // ensuring its not an empty input line
    if (!taskText) {
        alert('Please enter a task!');
        return;
    }
  
    // sending data to backend
    const response = await fetch('http://localhost:3000/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, task: taskText }),
    });
  
    // handling the server response incase smth failed
    const result = await response.json();
    if (result.success) {
        alert(result.message);
        loadTasks(); // Reload the task list
        taskInput.value = ''; // Clear the input field
    } else {
        alert('womp womp cant add task!');
    }
  });
  

async function deleteTask(taskId) {
    const response = await fetch(`http://localhost:3000/tasks/${taskId}`, {
      method: 'DELETE',
    });
  
    const result = await response.json();
    if (result.success) {
        alert('Task deleted!');
        loadTasks(); // Reload the task list
    } else {
        alert('Failed to delete task!');
    }
}
  