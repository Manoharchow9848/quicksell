import './KanbanBoard.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import nopriority from './assets/No-priority.svg';
import low from './assets/Img - Low Priority.svg';
import medium from './assets/Img - Medium Priority.svg';
import high from './assets/Img - High Priority.svg';
import urgent from './assets/SVG - Urgent Priority colour.svg';
import display from './assets/Display.svg';
import todoImg from './assets/To-do.svg';
import inProgressImg from './assets/in-progress.svg';
import backlogImg from './assets/Backlog.svg';
import doneImg from './assets/Done.svg';
import plusIcon from './assets/add.svg'; // Import the plus icon
import minusIcon from './assets/3dot.svg'; // Import the minus icon

const priorityImages = {
  "No priority": nopriority,
  "Low": low,
  "Medium": medium,
  "High": high,
  "Urgent": urgent,
};

const statusImages = {
  Todo: todoImg,
  "In progress": inProgressImg,
  Backlog: backlogImg,
  Done: doneImg,
};

const ALL_STATUSES = ['Todo', 'In progress', 'Backlog', 'Done'];

const KanbanBoard = () => {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [grouping, setGrouping] = useState(() => localStorage.getItem('grouping') || 'status');
  const [sortOption, setSortOption] = useState('priority');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get('https://api.quicksell.co/v1/internal/frontend-assignment');
        setTickets(data.tickets);
        setUsers(data.users);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    localStorage.setItem('grouping', grouping);
  }, [grouping]);

  const groupTickets = () => {
    let groupedTickets = {};
    
    switch (grouping) {
      case 'user':
        groupedTickets = tickets.reduce((acc, ticket) => {
          const user = users.find((u) => u.id === ticket.userId)?.name || 'Unknown';
          (acc[user] = acc[user] || []).push(ticket);
          return acc;
        }, {});
        break;
      case 'priority':
        groupedTickets = tickets.reduce((acc, ticket) => {
          const priority = ["No priority", "Low", "Medium", "High", "Urgent"][ticket.priority];
          (acc[priority] = acc[priority] || []).push(ticket);
          return acc;
        }, {});
        break;
      case 'status':
      default:
        groupedTickets = tickets.reduce((acc, ticket) => {
          (acc[ticket.status] = acc[ticket.status] || []).push(ticket);
          return acc;
        }, {});
        break;
    }

    // Ensure all statuses are included, even if empty
    if (grouping === 'status') {
      ALL_STATUSES.forEach((status) => {
        if (!groupedTickets[status]) {
          groupedTickets[status] = [];
        }
      });
    }

    return groupedTickets;
  };

  const sortedTickets = (tickets) => {
    return [...tickets].sort((a, b) => {
      if (sortOption === 'priority') {
        return b.priority - a.priority;
      }
      return a.title.localeCompare(b.title);
    });
  };

  const renderTickets = (group) => {
    return sortedTickets(group).map((ticket) => (
      <div key={ticket.id} className="ticket-card">
        <h3 className="ticket-title">{ticket.title}</h3>
        <div className="ticket-status">
          <img src={statusImages[ticket.status]} alt={`${ticket.status} status`} className="icon" />
          <p>Status: {ticket.status}</p>
        </div>
        <div className="ticket-priority">
          <p className="priority-label">Priority:</p>
          <img src={priorityImages["No priority"]} alt="No priority" className="icon" />
          <p>{["No priority", "Low", "Medium", "High", "Urgent"][ticket.priority]}</p>
        </div>
      </div>
    ));
  };

  const groupedTickets = groupTickets();

  return (
    <div className="kanban-container">
      <div className="controls">
        <div>
          <label className="flex items-center font-semibold">
            <img src={display} className="mr-1" alt="Display Icon" /> Display
          </label>
          <select
            value={grouping}
            onChange={(e) => setGrouping(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="status">Status</option>
            <option value="user">User</option>
            <option value="priority">Priority</option>
          </select>
        </div>

        <div>
          <label className="mr-2 font-semibold">Sort By:</label>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="priority">Priority</option>
            <option value="title">Title</option>
          </select>
        </div>
      </div>

      <div className="group-container">
        {Object.keys(groupedTickets).map((groupKey) => (
          <div key={groupKey} className="group-card">
            <div className="header">
              <h2>{groupKey} ({groupedTickets[groupKey].length})</h2>
              <div className="icon-container">
                {grouping === 'priority' && priorityImages[groupKey] && (
                  <img src={priorityImages[groupKey]} alt={`${groupKey} priority`} className="icon" />
                )}
                {grouping === 'status' && statusImages[groupKey] && (
                  <img src={statusImages[groupKey]} alt={`${groupKey} status`} className="icon" />
                )}
                <img src={plusIcon} alt="Add" className="icon" />
                <img src={minusIcon} alt="Remove" className="icon" />
              </div>
            </div>
            {renderTickets(groupedTickets[groupKey])}
          </div>
        ))}
      </div>
    </div>
  );
};

export default KanbanBoard;
