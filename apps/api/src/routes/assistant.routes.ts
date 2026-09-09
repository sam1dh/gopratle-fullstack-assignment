import express from "express";
import {
  handleAssistantMessage,
  handleTranscribe,
  handleSpeak,
} from "../controllers/assistant.controller.js";

const router: express.Router = express.Router();

router.post("/message", handleAssistantMessage);
router.post("/transcribe", handleTranscribe);
router.post("/speak", handleSpeak);

export default router;
