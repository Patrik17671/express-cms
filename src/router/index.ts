import express from 'express';
import authentication from './authentication';
import users from './users';

const router = express.Router();

// Function to set up the main router for the application.
// It integrates the routes into the main router.
export default (): express.Router => {
  authentication(router);
  users(router);

  return router;
};
