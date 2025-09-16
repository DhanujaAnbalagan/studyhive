import React from 'react';
import { MdTimer, MdFlashOn, MdAssignmentTurnedIn, MdGroup, MdOutlineDone } from 'react-icons/md';
import { FaTrashAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import '../../App.css'; 

// Reusable Dashboard Card Component
const DashboardCard = ({ title, value, description, icon }) => (
  <div className="dashboard-card">
    <div className="card-header">
      <span className="card-title">{title}</span>
      {icon}
    </div>
    <div className="card-content">
      <span className="value">{value}</span>
      <span className="description">{description}</span>
    </div>
  </div>
);

// Individual Assignment Item Component
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

const Landing = ({ assignments, deleteAssignment, tasks }) => {
  // Logic to filter for assignments due in 3 days or less
  const upcomingAssignments = assignments.filter(assignment => {
    const daysMatch = assignment.dueDate.match(/(\d+)\s*days/);
    if (daysMatch) {
      return parseInt(daysMatch[1], 10) <= 3;
    }
    return false;
  });

  // Display the first 3 tasks
  const limitedTasks = tasks.slice(0, 3);
  
  return (
    <div className="dashboard-page">
      <div className="welcome-header">
        <h1>Welcome back!</h1>
        <p>Here's your study progress overview</p>
      </div>
      
      <div className="study-progress">
        <DashboardCard
          title="Today's Pomodoros"
          value="4"
          description="120 minutes studied"
          icon={<MdTimer />}
        />
        <DashboardCard
          title="Study Streak"
          value="7"
          description="days in a row"
          icon={<MdFlashOn />}
        />
        <DashboardCard
          title="Assignments Done"
          value={assignments.length}
          description="active assignments"
          icon={<MdAssignmentTurnedIn />}
        />
        <DashboardCard
          title="Study Buddies"
          value="3"
          description="active connections"
          icon={<MdGroup />}
        />
      </div>

      <div className="dashboard-widgets">
        {/* New To-Do List section */}
        <div className="upcoming-tasks-container">
          <h3>To-Do List</h3>
          <p>Your top priorities for today.</p>
          <div className="tasks-list">
            {limitedTasks.length > 0 ? (
              limitedTasks.map(task => (
                <div key={task.id} className="task-item">
                  <span className="task-name">{task.name}</span>
                  <MdOutlineDone className="task-done-icon" />
                </div>
              ))
            ) : (
              <p>No tasks to display.</p>
            )}
            <div className="task-actions">
              <Link to="/tasks"><button>Go to To-Do List</button></Link>
            </div>
          </div>
        </div>

        <div className="upcoming-assignments-container">
          <h3>Upcoming Assignments</h3>
          <p>Stay on top of your deadlines</p>
          <div className="assignments-list">
            {upcomingAssignments.length > 0 ? (
              upcomingAssignments.map(assignment => (
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
              <p>No upcoming assignments.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;