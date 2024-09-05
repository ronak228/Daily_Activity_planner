// server/index.js

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(
"mongodb+srv://ronakgadhiya:ronak2208@cluster0.eugor7h.mongodb.net/")
.then(()=>console.log("Mongodb connectes successfully"))
.catch((err)=>console.log(err));

// Define Task schema;
const taskSchema = new mongoose.Schema({
    date: String,
    todo: String,
    startTime: String,
    endTime: String,
    completed: { type: Boolean, default: false },
});

// Create Task model
const Task = mongoose.model("Task", taskSchema);

app.get("/plan", async (req, res) => {
    console.log("Received GET request at /plan");
    try {
        const tasks = await Task.find();
        res.json(tasks);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.post("/plan", async (req, res) => {
    const { date, todo, startTime, endTime } = req.body;
    const newTask = new Task({
        date,
        todo,
        startTime,
        endTime,
        completed: false,
    });

    try {
        await newTask.save();
        res.sendStatus(201);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.delete("/plan/:taskId", async (req, res) => {
    const taskId = req.params.taskId;

    try {
        const result = await Task.deleteOne({ _id: taskId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: "Task not found" });
        }

        res.sendStatus(204);
    } catch (error) {
        console.error("Error deleting task:", error);
        res.status(500).send(error.message);
    }
});

app.patch("/plan/:taskId", async (req, res) => {
    const taskId = req.params.taskId;

    try {
        const updatedTask = await Task.findByIdAndUpdate(
            taskId,
            { completed: req.body.completed },
            { new: true }
        );

        res.json(updatedTask);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
