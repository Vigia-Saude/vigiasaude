import { Router } from 'express';
import { PedidoController } from '../controllers/PedidoController';
import { AuditoriaController } from '../controllers/AuditoriaController';
import { AtaController } from '../controllers/AtaController';
import { CatmatController } from '../controllers/CatmatController';
import { UploadController, uploadConfig } from '../controllers/UploadController';
import { FornecedorController } from '../controllers/FornecedorController';
import { DashboardController } from '../controllers/DashboardController';
import { authMiddleware, roleMiddleware } from '../middlewares/auth';

const router = Router();
const pedidoController = new PedidoController();
const auditoriaController = new AuditoriaController();
const ataController = new AtaController();
const catmatController = new CatmatController();
const uploadController = new UploadController();
const fornecedorController = new FornecedorController();
const dashboardController = new DashboardController();

// Todas as rotas da API requerem autenticação
router.use(authMiddleware);

// Rota de Unidades (Secretaria / Unidades)
router.get('/unidades', async (req, res) => {
  try {
    const { listarUnidades } = await import('../services/tenantService');
    const unidades = await listarUnidades();
    return res.json(unidades);
  } catch (err) {
    console.error('Erro ao listar unidades:', err);
    return res.status(500).json({ error: 'Erro ao listar unidades' });
  }
});

// Rotas de Dashboard
router.get('/dashboard/stats', dashboardController.getStats);

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
router.get('/pedidos/:id', pedidoController.detalhes);
router.post('/pedidos', pedidoController.criarPedido);
router.put('/pedidos/:id', pedidoController.atualizarPedido);
router.patch('/pedidos/:id/status', pedidoController.atualizarStatus);
router.patch('/pedidos/:id/entrega', pedidoController.confirmarEntrega);

// Rotas de Auditoria (Restrito a COMPRADOR)
router.get('/auditoria', roleMiddleware(['COMPRADOR']), auditoriaController.listar);

// Rotas de Fornecedores
router.get('/fornecedores', fornecedorController.listar);
router.get('/fornecedores/:id', fornecedorController.detalhes);
router.post('/fornecedores', roleMiddleware(['COMPRADOR']), fornecedorController.criar);
router.put('/fornecedores/:id', roleMiddleware(['COMPRADOR']), fornecedorController.atualizar);
router.patch('/fornecedores/:id/status', roleMiddleware(['COMPRADOR']), fornecedorController.toggleStatus);

export default router;
