import express from "express";
import { addRequest, getAllRequests, confirmRequest } from "../controllers/requestController.js";

const router = express.Router();
router.post("/add", addRequest);
router.get("/all", getAllRequests);
router.post("/:requestId/confirm", confirmRequest);

export default router;
