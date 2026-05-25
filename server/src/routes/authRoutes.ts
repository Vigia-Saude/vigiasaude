import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { AuthController } from '../controllers/AuthController';
import { authMiddleware, roleMiddleware } from '../middlewares/auth';

const router = Router();
const authController = new AuthController();

// Limite específico para login e solicitação de acesso para prevenir brute force
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 15, // Máximo 15 tentativas
  message: { error: 'Muitas tentativas de login. Tente novamente em 15 minutos.' }
});

// Públicas
router.post('/login', loginLimiter, authController.login.bind(authController));
router.post('/solicitar-acesso', loginLimiter, authController.solicitarAcesso.bind(authController));
router.get('/fornecedores', authController.listarFornecedoresPublico.bind(authController));

// Protegidas — apenas Secretário
router.get(
  '/pendentes',
  authMiddleware,
  roleMiddleware(['SECRETARIO_SAUDE']),
  authController.listarPendentes.bind(authController)
);
router.get(
  '/ativos',
  authMiddleware,
  roleMiddleware(['SECRETARIO_SAUDE']),
  authController.listarAtivos.bind(authController)
);
router.get(
  '/desativados',
  authMiddleware,
  roleMiddleware(['SECRETARIO_SAUDE']),
  authController.listarDesativados.bind(authController)
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
router.put(
  '/usuarios/:id',
  authMiddleware,
  roleMiddleware(['SECRETARIO_SAUDE']),
  authController.editarUsuario.bind(authController)
);
router.post(
  '/desativar/:id',
  authMiddleware,
  roleMiddleware(['SECRETARIO_SAUDE']),
  authController.desativarUsuario.bind(authController)
);
router.get(
  '/usuarios',
  authMiddleware,
  roleMiddleware(['SECRETARIO_SAUDE']),
  authController.listarUsuarios.bind(authController)
);

export default router;
