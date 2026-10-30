import { Router } from "express";
import mongoose from "mongoose";
import Task from "../models/Task.js";

const router = Router();
const allowedStatuses = ["Pending", "In Progress", "Completed"];

router.get("/", async (_req, res, next) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) { next(error); }
});

router.post("/", async (req, res, next) => {
  try {
    const title = String(req.body.title || "").trim();
    const status = req.body.status || "Pending";
    if (!title) return res.status(400).json({ message: "Task title is required." });
    if (!allowedStatuses.includes(status)) return res.status(400).json({ message: "Invalid task status." });
    const task = await Task.create({ title, status });
    res.status(201).json(task);
  } catch (error) { next(error); }
});

router.patch("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid task ID." });
    const updates = {};
    if (req.body.title !== undefined) {
      updates.title = String(req.body.title).trim();
      if (!updates.title) return res.status(400).json({ message: "Task title cannot be empty." });
    }
    if (req.body.status !== undefined) {
      if (!allowedStatuses.includes(req.body.status)) return res.status(400).json({ message: "Invalid task status." });
      updates.status = req.body.status;
    }
    const task = await Task.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!task) return res.status(404).json({ message: "Task not found." });
    res.json(task);
  } catch (error) { next(error); }
});

router.delete("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid task ID." });
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found." });
    res.json({ message: "Task deleted successfully." });
  } catch (error) { next(error); }
});

export default router;
