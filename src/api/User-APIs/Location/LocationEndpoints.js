import express from "express";
import { LocationQueries } from "./LocationQueries.js";
import { AuthMiddleware } from "../../../Middlewares/GeneralMiddlewares.js";
const router = express.Router();

router.get("/get-states-in-nigeria", AuthMiddleware, async (req, res) => {
  try {
    const allStates = await LocationQueries.selectAllStates();
    if (allStates.rowCount < 1) return res.status(400).json({ error: "No state found!" });
    return res.status(200).json({ data: allStates.rows });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Server error, try agin!" });
  }
});

router.get("/all-lga-by-state-id/:state_id", AuthMiddleware, async (req, res) => {
  let { state_id } = req.params;
  state_id = parseInt(state_id);
  if (!state_id) {
    return res.status(400).json({ error: "state_id is required and must be a number" });
  }
  try {
    const allStates = await LocationQueries.selectAllLGAByStatesID();
    if (allStates.rowCount < 1) return res.status(400).json({ error: "No state found!" });
    return res.status(200).json({ data: allStates.rows });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Server error, try agin!" });
  }
});

export default router;
