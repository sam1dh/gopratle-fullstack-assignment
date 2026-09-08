import express from "express";
import {
  handleCreateRequirement,
  handleGetRequirement,
} from "../controllers/requirement.controller.js";

const router: express.Router = express.Router();

router.post("/", handleCreateRequirement);
router.get("/:id", handleGetRequirement);

export default router;
