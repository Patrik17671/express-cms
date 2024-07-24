import express from 'express';
import { createUser, getUserByEmail } from '../models/users';
import { random, authentication } from '../helpers';
import { SESSION_AUTH_TOKEN } from '../constants';

// Controller for user login.
// It checks the provided email and password, and if they are correct, generates a new session token and sets it as a cookie.
export const login = async (req: express.Request, res: express.Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.sendStatus(400);
    }

    const user = await getUserByEmail(email).select(
      '+authentication.salt +authentication.password',
    );

    if (!user) {
      return res.sendStatus(400);
    }

    // Create the expected password hash using the stored salt and provided password.
    const expectedHash = authentication(user.authentication.salt, password);

    if (user.authentication.password != expectedHash) {
      return res.sendStatus(403);
    }

    // Generate a new session token for the user.
    const salt = random();
    user.authentication.sessionToken = authentication(salt, user._id.toString());

    await user.save();

    // Set the session token as a cookie in the response.
    res.cookie(SESSION_AUTH_TOKEN, user.authentication.sessionToken, {
      domain: 'localhost',
      path: '/',
    });

    return res.status(200).json(user).end();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};

// Controller for user registration.
// It checks if a user with the given email already exists, and if not, creates a new user and saves them to the database.
export const register = async (req: express.Request, res: express.Response) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      return res.sendStatus(400);
    }

    const existingUser = await getUserByEmail(email);

    if (existingUser) {
      return res.sendStatus(400);
    }

    const salt = random();
    const user = await createUser({
      email,
      username,
      authentication: {
        salt,
        password: authentication(salt, password),
      },
    });

    return res.status(200).json(user).end();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};
