import express from 'express';
import { get, merge } from 'lodash';
import { getUserBySessionToken } from '../models/users';
import { SESSION_AUTH_TOKEN } from '../constants';

// Middleware to check if the current user is the owner of the resource they are trying to access.
export const isOwner = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  try {
    const { id } = req.params;
    const currentUserId = get(req, 'identity._id') as string;

    if (!currentUserId) {
      return res.sendStatus(403);
    }

    if (currentUserId.toString() != id) {
      return res.sendStatus(403);
    }

    next();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};

// Middleware to check if the user is authenticated.
export const isAuthenticated = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  try {
    const sessionToken = req.cookies[SESSION_AUTH_TOKEN];

    if (!sessionToken) {
      return res.sendStatus(403);
    }

    const existingUser = await getUserBySessionToken(sessionToken).exec();

    if (!existingUser) {
      return res.sendStatus(403);
    }

    // Merge the user identity into the request object for further use in the application.
    merge(req, { identity: existingUser });

    return next();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};
