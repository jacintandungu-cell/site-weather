import React from "react";
import TaskItem from "./TaskItem";

function TaskList({ tasks, setTasks, setError }) {
  return (
    <div className="task-list">
      {tasks.length === 0 ? (
        <p>No tasks yet. Add one above!</p>
      ) : (
        tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            setTasks={setTasks}
            setError={setError}
          />
        ))
      )}
    </div>
  );
}

export default TaskList;
