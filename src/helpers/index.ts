import crypto from 'crypto';
import { HASH_SECRET } from '../constants';

// The random function generates a random string of 128 bytes and returns it in base64 format.
// It is used, for example, to generate a salt for passwords.
export const random = () => crypto.randomBytes(128).toString('base64');

// The authentication function creates a hash of the password combined with the salt.
// It uses HMAC (Hash-based Message Authentication Code) with the SHA-256 algorithm to create a secure hash.
// HASH_SECRET is a secret key that is added to the hash for additional security.
// This function is used for authenticating users by comparing the stored hash with the hash of the provided password
export const authentication = (salt: string, password: string) => {
  return crypto.createHmac('sha256', [salt, password].join('/')).update(HASH_SECRET).digest('hex');
};
