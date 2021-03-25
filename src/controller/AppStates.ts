export const APP_STATES = {
  NONE: 'NONE',              // Nothing going on
  NODE_EDIT: 'NODE_EDIT',    // Add node mode
  EDGE_EDIT: 'EDGE_EDIT',    // Add edge mode
  DELETE_OBJ: 'DELETE_OBJ',  // Delete object mode
  RUNNING: 'RUNNING',        // Active while algorithm is running
  PAUSED: 'PAUSED',          // Algorithm has started running, but display paused
  PREDICTING: 'PREDICTING'   // User is making their prediction before algo run
};
