import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/common/Navbar.jsx'; // Assuming Navbar is your sidebar
import Landing from './components/dashboard/Landing.jsx';
import StudyBuddyFinder from './components/buddies/StudyBuddyFinder.jsx';
import StudyGroupFinder from './components/groups/StudyGroupFinder.jsx';
import TasksManager from './components/tasks/TasksManager.jsx';
import AssignmentTracker from './components/tasks/Assignment.jsx'; 
import './App.css';

const App = () => {
  const [assignments, setAssignments] = useState([
    { id: 1, name: 'Math Homework', subject: 'Mathematics', dueDate: '2 days' },
    { id: 2, name: 'History Essay', subject: 'History', dueDate: '4 days' },
    { id: 3, name: 'Science Project', subject: 'Biology', dueDate: '1 week' },
  ]);

  const [tasks, setTasks] = useState([
    { id: 1, name: 'Read Chapter 3', completed: false },
    { id: 2, name: 'Start Calculus Homework', completed: false },
    { id: 3, name: 'Review History notes', completed: false },
  ]);

  const addAssignment = (newAssignment) => {
    setAssignments((prevAssignments) => [...prevAssignments, { ...newAssignment, id: Date.now() }]);
  };

  const deleteAssignment = (id) => {
    setAssignments((prevAssignments) => prevAssignments.filter((assignment) => assignment.id !== id));
  };
  
  const addTask = (newTask) => {
    setTasks((prevTasks) => [...prevTasks, { ...newTask, id: Date.now() }]);
  };

  const deleteTask = (id) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
  };

  return (
    <Router>
      <div className="full-page-container">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Landing assignments={assignments} deleteAssignment={deleteAssignment} tasks={tasks} />} />
            <Route path="/assignments" element={<AssignmentTracker assignments={assignments} addAssignment={addAssignment} deleteAssignment={deleteAssignment} />} />
            <Route path="/tasks" element={<TasksManager tasks={tasks} addTask={addTask} deleteTask={deleteTask} />} />
            <Route path="/buddies" element={<StudyBuddyFinder />} />
            <Route path="/groups" element={<StudyGroupFinder />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;