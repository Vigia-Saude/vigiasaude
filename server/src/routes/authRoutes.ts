import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authMiddleware, roleMiddleware } from '../middlewares/auth';

const router = Router();
const authController = new AuthController();

// Públicas
router.post('/login', authController.login.bind(authController));
router.post('/solicitar-acesso', authController.solicitarAcesso.bind(authController));
router.get('/fornecedores', authController.listarFornecedoresPublico.bind(authController));

// Protegidas — apenas Secretário
router.get(
  '/pendentes',
  authMiddleware,
  roleMiddleware(['SECRETARIO_SAUDE']),
  authController.listarPendentes.bind(authController)
);
router.post(
  '/aprovar/:id',
  authMiddleware,
  roleMiddleware(['SECRETARIO_SAUDE']),
  authController.aprovarUsuario.bind(authController)
);
router.post(
  '/recusar/:id',
  authMiddleware,
  roleMiddleware(['SECRETARIO_SAUDE']),
  authController.recusarUsuario.bind(authController)
);

export default router;
