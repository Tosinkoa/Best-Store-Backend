import pool from "../../../LIB/DB-Client.js";

export const LocationQueries = {
  selectAllStates() {
    return pool.query("SELECT * FROM nigeria_states");
  },
  selectAllLGAByStatesID(stateId) {
    return pool.query("SELECT * FROM nigeria_lgas WHERE state_id = $1", [stateId]);
  },
};
