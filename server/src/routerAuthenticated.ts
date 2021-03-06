import express from 'express';
import jwt from 'express-jwt';
import jwks from 'jwks-rsa';
import * as tripController from './controllers/trip.controller';
import * as photoController from './controllers/photo.controller';

const router = express.Router();

const jwtCheck = jwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: 'https://dev-g7dchufc.eu.auth0.com/.well-known/jwks.json',
  }),
  audience: 'https://grouptripper/api',
  issuer: 'https://dev-g7dchufc.eu.auth0.com/',
  algorithms: ['RS256'],
});

router.get('/trips', tripController.getAllTrips);
router.get('/trips/:id', tripController.getOneTrip);
router.post('/trips', jwtCheck, tripController.createTrip);
router.delete('/trips/:id', tripController.deleteTrip);
router.get('/photos/:queryText', photoController.getPhoto);

export default router;
