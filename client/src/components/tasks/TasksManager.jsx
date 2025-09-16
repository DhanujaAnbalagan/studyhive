import React, { useState } from 'react';
import { MdAddCircleOutline, MdDelete } from 'react-icons/md';
import '../../App.css';

// Reusable Task Item Component
const TaskItem = ({ id, name, onDelete }) => (
  <div className="task-item">
    <span className="task-name">{name}</span>
    <button onClick={() => onDelete(id)} className="delete-btn">
      <MdDelete />
    </button>
  </div>
);

const TasksManager = ({ tasks, addTask, deleteTask }) => {
  const [newTask, setNewTask] = useState({ name: '' });
  
  const handleAddTask = (e) => {
    e.preventDefault();
    if (newTask.name) {
      addTask(newTask);
      setNewTask({ name: '' });
    }
  };

  return (
    <div className="tasks-manager-page">
      <h1>To-Do List</h1>
      <p>Manage all your daily tasks here.</p>
      
      <div className="new-task-form-container">
        <h3>Add New Task</h3>
        <form onSubmit={handleAddTask}>
          <input type="text" placeholder="Task Name" value={newTask.name} onChange={(e) => setNewTask({ ...newTask, name: e.target.value })} required />
          <button type="submit">
            <MdAddCircleOutline /> Add Task
          </button>
        </form>
      </div>

      <div className="all-tasks-list">
        <h3>All Tasks</h3>
        {tasks.length > 0 ? (
          tasks.map(task => (
            <TaskItem
              key={task.id}
              id={task.id}
              name={task.name}
              onDelete={deleteTask}
            />
          ))
        ) : (
          <p>You have no tasks.</p>
        )}
      </div>
    </div>
  );
};

export default TasksManager;