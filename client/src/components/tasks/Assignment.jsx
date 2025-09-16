import React, { useState } from 'react';
import { MdAddCircleOutline } from 'react-icons/md';
import { FaTrashAlt } from 'react-icons/fa';
import '../../App.css';

// Reusable Assignment Item Component
const AssignmentItem = ({ id, name, subject, dueDate, onDelete }) => (
  <div className="assignment-item">
    <div className="assignment-details">
      <h4 className="name">{name}</h4>
      <span className="subject">{subject}</span>
    </div>
    <span className="assignment-due-date">Due in {dueDate}</span>
    <button onClick={() => onDelete(id)} className="delete-btn">
      <FaTrashAlt />
    </button>
  </div>
);

const AssignmentTracker = ({ assignments, addAssignment, deleteAssignment }) => {
  const [newAssignment, setNewAssignment] = useState({ name: '', subject: '', dueDate: '' });
  
  const handleAddAssignment = (e) => {
    e.preventDefault();
    if (newAssignment.name && newAssignment.subject) {
      addAssignment(newAssignment);
      setNewAssignment({ name: '', subject: '', dueDate: '' });
    }
  };

  return (
    <div className="assignments-tracker-page">
      <h1>Assignment Tracker</h1>
      <p>Manage all your assignments in one place.</p>
      
      <div className="new-assignment-form-container">
        <h3>Add New Assignment</h3>
        <form onSubmit={handleAddAssignment}>
          <input type="text" placeholder="Assignment Name" value={newAssignment.name} onChange={(e) => setNewAssignment({ ...newAssignment, name: e.target.value })} required />
          <input type="text" placeholder="Subject" value={newAssignment.subject} onChange={(e) => setNewAssignment({ ...newAssignment, subject: e.target.value })} required />
          <input type="text" placeholder="Due Date (e.g., in 2 days)" value={newAssignment.dueDate} onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })} />
          <button type="submit">
            <MdAddCircleOutline /> Add Assignment
          </button>
        </form>
      </div>

      <div className="all-assignments-list">
        <h3>All Assignments</h3>
        {assignments.length > 0 ? (
          assignments.map(assignment => (
            <AssignmentItem
              key={assignment.id}
              id={assignment.id}
              name={assignment.name}
              subject={assignment.subject}
              dueDate={assignment.dueDate}
              onDelete={deleteAssignment}
            />
          ))
        ) : (
          <p>You have no assignments.</p>
        )}
      </div>
    </div>
  );
};

export default AssignmentTracker;