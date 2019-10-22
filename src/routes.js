import { Router } from 'express';
import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import StudentController from './app/controllers/StudentController';
import PlanController from './app/controllers/PlanController';
import RegistrationController from './app/controllers/RegistrationController';
import CheckinController from './app/controllers/CheckinController';
import HelpOrderController from './app/controllers/HelpOrderController';
import authMiddleware from './app/middlewares/auth';

const routes = new Router();

routes.post('/sessions', SessionController.store);

routes.use(authMiddleware);
routes.post('/users', UserController.store);
routes.put('/users/:id', UserController.update);
routes.post('/students', StudentController.store);
routes.put('/students/:id', StudentController.update);

routes.get('/plans/', PlanController.index);
routes.post('/plans', PlanController.store);
routes.put('/plans/:id', PlanController.update);
routes.delete('/plans/:id', PlanController.delete);

routes.get('/registrations', RegistrationController.index);
routes.post('/registrations', RegistrationController.store);
routes.delete('/registrations/:id', RegistrationController.delete);
routes.put('/registrations/:id', RegistrationController.update);

routes.get('/students/:id/checkins', CheckinController.index);
routes.post('/students/:id/checkins', CheckinController.store);

// routes.get('/help-orders/', RespondController.index);
routes.get('/students/:id/help-orders', HelpOrderController.index);
routes.post('/students/:id/help-orders', HelpOrderController.store);
routes.put('/help-orders/:id/answer', HelpOrderController.update);

export default routes;
