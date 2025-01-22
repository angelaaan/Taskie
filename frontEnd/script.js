document.getElementById('addTaskBtn').addEventListener('click', () => {
    const taskInput = document.getElementById('taskInput');
    const taskList = document.getElementById('taskList');
    const taskText = taskInput.value.trim();
  
    if (taskText) {
      const li = document.createElement('li');
      li.innerHTML = `
        <span>${taskText}</span>
        <button onclick="this.parentElement.remove()">🗑️</button>
      `;
      taskList.appendChild(li);
      taskInput.value = '';
    } else {
      alert('Please enter a task!');
    }
  });