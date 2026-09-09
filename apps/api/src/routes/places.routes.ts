import express from "express";
import { handleAutocomplete, handlePlaceDetails } from "../controllers/places.controller.js";

const router: express.Router = express.Router();

router.get("/autocomplete", handleAutocomplete);
router.get("/:placeId", handlePlaceDetails);

export default router;
