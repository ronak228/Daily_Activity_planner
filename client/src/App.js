//client/src/App.js

import React, { useState, useEffect } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./App.css";

function App() {
    const [tasks, setTasks] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [newTask, setNewTask] = useState("");
    const [newTaskStartTime, setNewTaskStartTime] = useState("00:00");
    const [newTaskEndTime, setNewTaskEndTime] = useState("00:00");

    const handleDateClick = (date) => {
        setSelectedDate(date);
    };

    const fetchTasks = async () => {
        try {
            const response = await axios.get(
                `http://frontend-container:3001/plan?date=${ //localhost::3001
                    selectedDate.toISOString().split("T")[0]
                }`
            );
            const tasksData = response.data;
            setTasks(tasksData);

            // Store tasks in local storage
            localStorage.setItem("tasks", JSON.stringify(tasksData));
        } catch (error) {
            console.error("Error fetching tasks:", error);
        }
    };

    const handleAddTask = async () => {
        if (newTask) {
            const formattedDate = selectedDate.toISOString()
                                              .split("T")[0];
            const startTime = newTaskStartTime;
            const endTime = newTaskEndTime;

            try {
                // Add the new task
                await axios.post("http://frontend-container:3001/plan", {
                    date: formattedDate,
                    todo: newTask,
                    startTime,
                    endTime,
                });

                // Fetch tasks after adding the new task
                await fetchTasks();

                // Clear the input fields
                setNewTask("");
                setNewTaskStartTime("00:00");
                setNewTaskEndTime("00:00");
            } catch (error) {
                console.error("Error adding task:", error);
            }
        }
    };

    useEffect(() => {
        fetchTasks();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedDate]);

    const handleDeleteTask = async (taskId) => {
        try {
            await axios.delete(`http://frontend-container:3001/plan/${taskId}`);

            // Update state by removing the deleted task
            setTasks((prevTasks) =>
                prevTasks.filter((task) => task._id !== taskId)
            );
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    };

    const handleCompleteTask = async (taskId, taskIndex) => {
        try {
            // Send a request to mark the task as completed on the server
            await axios.patch(`http://frontend-container:3001/plan/${taskId}`, {
                completed: true,
            });

            // Fetch the updated tasks from the server after completion
            await fetchTasks();

            setTasks((prevTasks) => {
                const updatedTasks = [...prevTasks];
                updatedTasks[taskIndex].completed = true;
                return updatedTasks;
            });
        } catch (error) {
            console.error("Error marking task as completed:", error);
        }
    };

    useEffect(() => {
        // Retrieve tasks from local storage on component mount
        const storedTasks = localStorage.getItem("tasks");
        if (storedTasks) {
            setTasks(JSON.parse(storedTasks));
        } else {
            fetchTasks();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }, [tasks]);

    return (
        <div className="App">
            <nav>
                <div className="logo">Daily Planner App</div>
            </nav>
            <div className="content">
                <div className="hero-section">
                    <div className="left-part">
                        <div className="calendar-container">
                            <Calendar
                                onChange={handleDateClick}
                                value={selectedDate}
                                onClickDay={() => {}}
                            />
                        </div>
                    </div>
                    <div className="right-part">
                        <div className="tasks">
                            <h2>Tasks for {selectedDate.toDateString()}</h2>
                            <ul>
                                {tasks
                                    .filter(
                                        (task) =>
                                            task.date ===
                                            selectedDate
                                                .toISOString()
                                                .split("T")[0]
                                    )
                                    .map((task, index) => (
                                        <li
                                            key={index}
                                            style={{
                                                backgroundColor: task.completed
                                                    ? "lightgreen"
                                                    : "inherit",
                                            }}
                                        >
                                            <div className="task-details">
                                                <span className="task-text">
                                                    {task.todo}
                                                </span>
                                                {task.startTime &&
                                                    task.endTime && (
                                                        <span className="time-range">
                                                            {task.startTime} -{" "}
                                                            {task.endTime}
                                                        </span>
                                                    )}
                                                <button
                                                    className="delete-button"
                                                    onClick={() =>
                                                        handleDeleteTask(
                                                            task._id
                                                        )
                                                    }
                                                >
                                                    X
                                                </button>
                                                {!task.completed && (
                                                    <button
                                                        className="complete-button"
                                                        onClick={() =>
                                                            handleCompleteTask(
                                                                task._id,
                                                                index
                                                            )
                                                        }
                                                    >
                                                        &#10004;
                                                    </button>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                            </ul>
                            <div className="add-task">
                                <input
                                    type="text"
                                    placeholder="Add a new task"
                                    value={newTask}
                                    onChange={(e) => setNewTask(e.target.value)}
                                />
                                <div className="time-inputs">
                                    <input
                                        type="time"
                                        value={newTaskStartTime}
                                        onChange={(e) =>
                                            setNewTaskStartTime(e.target.value)
                                        }
                                    />
                                    <span>-</span>
                                    <input
                                        type="time"
                                        value={newTaskEndTime}
                                        onChange={(e) =>
                                            setNewTaskEndTime(e.target.value)
                                        }
                                    />
                                </div>
                                <button onClick={handleAddTask}>
                                    Add Task
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
