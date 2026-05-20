import { Router } from 'express';
import { PedidoController } from '../controllers/PedidoController';
import { AuditoriaController } from '../controllers/AuditoriaController';
import { AtaController } from '../controllers/AtaController';
import { CatmatController } from '../controllers/CatmatController';
import { UploadController, uploadConfig } from '../controllers/UploadController';
import { authMiddleware, roleMiddleware } from '../middlewares/auth';

const router = Router();
const pedidoController = new PedidoController();
const auditoriaController = new AuditoriaController();
const ataController = new AtaController();
const catmatController = new CatmatController();
const uploadController = new UploadController();

// Todas as rotas da API requerem autenticação
router.use(authMiddleware);

// Rotas de Atas
router.get('/atas', ataController.listar);
router.get('/atas/:id', ataController.detalhes);
router.post('/atas', ataController.criar);
router.post('/atas/:ataId/consumos', ataController.registrarConsumo);

// Rotas de CATMAT
router.get('/catmat/buscar', catmatController.buscar);
router.get('/catmat/:codigoBr', catmatController.buscarPorCodigo);

// Rotas de Upload
router.post('/upload', uploadConfig.single('file'), uploadController.upload);

// Rotas de Pedidos
router.get('/pedidos', pedidoController.listar);
router.post('/pedidos', pedidoController.criarPedido);
router.patch('/pedidos/:id/entrega', pedidoController.confirmarEntrega);

// Rotas de Auditoria (Restrito a COMPRADOR)
router.get('/auditoria', roleMiddleware(['COMPRADOR']), auditoriaController.listar);

export default router;
