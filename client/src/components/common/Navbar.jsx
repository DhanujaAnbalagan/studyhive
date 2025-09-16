import React from 'react';
import { Link } from 'react-router-dom';
import { MdDashboard, MdTimer, MdGroup, MdTimeline, MdAssignment } from 'react-icons/md';

const Navbar = () => {
  return (
    <aside className="sidebar">
      <div className="logo">StudyHive</div>
      <nav className="sidebar-nav">
        <ul>
          <li><Link to="/"><MdDashboard /><span>Dashboard</span></Link></li>
          <li><Link to="/timer"><MdTimer /><span>Pomodoro Timer</span></Link></li>
          <li><Link to="/buddies"><MdGroup /><span>Study Buddies</span></Link></li>
          <li><Link to="/heatmap"><MdTimeline /><span>Study Group</span></Link></li>
          <li><Link to="/assignments"><MdAssignment /><span>Assignments</span></Link></li>
          <li><Link to="/tasks"><MdAssignment /><span>To-Do List</span></Link></li>
        </ul>
      </nav>
    </aside>
  );
};

export default Navbar;