import express, { Router, Request, Response, NextFunction } from "express";
import { login, register, google, oauthToken } from "../controllers/auth.controller";
import {authenticateJWT } from '../middlewares/auth';
import passport from '../utils/passport';

const router: Router = express.Router();


/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and authorization routes
 */

/**
 * @swagger
 * /api/v1/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       '201':
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       '400':
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

router.post('/register', register);


/**
 * @swagger
 * /api/v1/login:
 *   post:
 *     summary: User login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginCredentials'
 *     responses:
 *       '200':
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       '401':
 *         description: Unauthorized - Invalid email or password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/login', login);


router.get('/login', (req, res) => {
    res.send('Login page');
});  


/**
 * @swagger
 * /api/v1/google:
 *   get:
 *     summary: Redirect to Google for authentication
 *     tags: [Authentication]
 *     responses:
 *       '302':
 *         description: Redirect to Google for authentication
 *         headers:
 *           Location:
 *             description: URL to redirect for Google authentication
 *             schema:
 *               type: string
 *       '401':
 *         description: Unauthorized - Google authentication error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/google', google);

router.get('/auth/google/callback', 
  passport.authenticate('google', { successRedirect: '/', 
  failureRedirect: 'http://localhost:3000/api/v1/login' }));


/**
 * @swagger
 * /api/v1/logout:
 *   get:
 *     summary: Log out the current user
 *     tags: [Authentication]
 *     responses:
 *       '302':
 *         description: Redirect to the home page after successful logout
 *         headers:
 *           Location:
 *             description: URL to redirect after logout
 *             schema:
 *               type: string
 *       '401':
 *         description: Unauthorized - User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/logout', function(req, res, next){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});


/**
 * @swagger
 * /api/v1/authorize:
 *   get:
 *     summary: Generate authorization token for the current user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Authorization token generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthorizationResponse'
 *       '401':
 *         description: Unauthorized - User not logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/authorize', oauthToken);



router.get('/protected', authenticateJWT, (req, res) => {
  res.send({msg: 'I am protected and you are authorized'});
});

module.exports = router;