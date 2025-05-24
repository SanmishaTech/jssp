import React from 'react';
import { Route } from 'react-router-dom';
import TaskManager from './TaskManager';

// Task manager routes to be included in the main router
const TaskManagerRoutes = () => (
  <Route path="/taskmanager" element={<TaskManager />} />
);

export default TaskManagerRoutes;
