import { Router } from 'express';
import { PedidoController } from '../controllers/PedidoController';
import { AuditoriaController } from '../controllers/AuditoriaController';
import { AtaController } from '../controllers/AtaController';
import { CatmatController } from '../controllers/CatmatController';
import { UploadController, uploadConfig } from '../controllers/UploadController';
import { FornecedorController } from '../controllers/FornecedorController';
import { DashboardController } from '../controllers/DashboardController';
import { CdController } from '../controllers/CdController';
import { authMiddleware, roleMiddleware } from '../middlewares/auth';
import { listarUnidades } from '../services/tenantService';
import { PedidoReposicaoController } from '../controllers/PedidoReposicaoController';
import { FarmaciaController } from '../controllers/FarmaciaController';
import { MotoristaController } from '../controllers/MotoristaController';
import { RegulacaoController, uploadRegulacaoConfig } from '../controllers/RegulacaoController';
import { PacienteController } from '../controllers/PacienteController';

const router = Router();
const pedidoController = new PedidoController();
const auditoriaController = new AuditoriaController();
const ataController = new AtaController();
const catmatController = new CatmatController();
const uploadController = new UploadController();
const fornecedorController = new FornecedorController();
const dashboardController = new DashboardController();
const cdController = new CdController();
const pedidoReposicaoController = new PedidoReposicaoController();
const farmaciaController = new FarmaciaController();
const motoristaController = new MotoristaController();
const regulacaoController = new RegulacaoController();
const pacienteController = new PacienteController();

// Todas as rotas da API requerem autenticação
router.use(authMiddleware);

// Rota de Unidades (Secretaria / Unidades)
router.get('/unidades', async (req, res) => {
  try {
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
router.post('/atas', roleMiddleware(['COMPRADOR']), ataController.criar);
router.post('/atas/:ataId/consumos', roleMiddleware(['COMPRADOR', 'GESTOR_ESTOQUE', 'FARMACIA', 'POSTO_SAUDE']), ataController.registrarConsumo);

// Rotas de CATMAT
router.get('/catmat/buscar', catmatController.buscar);
router.get('/catmat/:codigoBr', catmatController.buscarPorCodigo);

// Rotas de Upload
router.post('/upload', roleMiddleware(['COMPRADOR', 'GESTOR_ESTOQUE']), uploadConfig.single('file'), uploadController.upload);

// Rotas de Pedidos
router.get('/pedidos', pedidoController.listar);
router.get('/pedidos/:id', pedidoController.detalhes);
router.post('/pedidos', roleMiddleware(['COMPRADOR']), pedidoController.criarPedido);
router.put('/pedidos/:id', roleMiddleware(['COMPRADOR', 'FORNECEDOR']), pedidoController.atualizarPedido);
router.patch('/pedidos/:id/status', roleMiddleware(['COMPRADOR', 'FORNECEDOR']), pedidoController.atualizarStatus);
router.patch('/pedidos/:id/entrega', roleMiddleware(['COMPRADOR', 'FORNECEDOR']), pedidoController.confirmarEntrega);

// Rotas de Auditoria (Restrito a COMPRADOR)
router.get('/auditoria', roleMiddleware(['COMPRADOR']), auditoriaController.listar);

// Rotas de Fornecedores
router.get('/fornecedores', fornecedorController.listar);
router.get('/fornecedores/:id', fornecedorController.detalhes);
router.post('/fornecedores', roleMiddleware(['COMPRADOR']), fornecedorController.criar);
router.put('/fornecedores/:id', roleMiddleware(['COMPRADOR']), fornecedorController.atualizar);
router.patch('/fornecedores/:id/status', roleMiddleware(['COMPRADOR']), fornecedorController.toggleStatus);

// Rotas do Centro de Distribuição (CD)
router.post('/cd/notas-fiscais/xml', roleMiddleware(['GESTOR_ESTOQUE']), cdController.lerNfXml);
router.post('/cd/notas-fiscais', roleMiddleware(['GESTOR_ESTOQUE']), cdController.registrarNf);
router.get('/cd/notas-fiscais', cdController.listarNfs);
router.get('/cd/notas-fiscais/:id', cdController.obterNf);
router.post('/cd/notas-fiscais/:id/conferir', roleMiddleware(['GESTOR_ESTOQUE']), cdController.conferirNf);
router.get('/cd/estoque/detalhes', cdController.obterDetalhesMedicamento);
router.get('/cd/estoque', cdController.listarEstoque);
router.post('/cd/recalls', roleMiddleware(['COMPRADOR']), cdController.registrarRecall);
router.get('/cd/recalls', cdController.listarRecalls);
router.patch('/cd/recalls/:id/encerrar', roleMiddleware(['COMPRADOR']), cdController.encerrarRecall);
router.get('/cd/alertas', cdController.listarAlertas);
router.patch('/cd/alertas/:id/lido', cdController.marcarAlertaLido);
router.get('/cd/auditoria', cdController.listarAuditoria);

// Rotas de Pedidos de Recomposição de Estoque (CD)
router.get('/cd/pedidos-reposicao', pedidoReposicaoController.listar);
router.get('/cd/pedidos-reposicao/motoristas', pedidoReposicaoController.listarMotoristas);
router.get('/cd/pedidos-reposicao/:id', pedidoReposicaoController.detalhes);
router.post('/cd/pedidos-reposicao', roleMiddleware(['FARMACIA', 'POSTO_SAUDE', 'GESTOR_ESTOQUE']), pedidoReposicaoController.criar);
router.patch('/cd/pedidos-reposicao/:id/status', roleMiddleware(['GESTOR_ESTOQUE', 'ENTREGADOR', 'FARMACIA', 'POSTO_SAUDE']), pedidoReposicaoController.atualizarStatus);

// Rotas da Farmácia (Dispensação)
router.get('/farmacia/estoque', farmaciaController.buscarEstoque);
router.post('/farmacia/dispensar', roleMiddleware(['FARMACIA', 'POSTO_SAUDE']), farmaciaController.dispensar);
router.get('/farmacia/dispensacoes/recentes', farmaciaController.dispensacoesRecentes);
router.get('/farmacia/pacientes', farmaciaController.buscarPacientes);
router.post('/farmacia/validar-qr', roleMiddleware(['FARMACIA', 'POSTO_SAUDE']), farmaciaController.validarQrCode);
router.get('/farmacia/embalagem/:id/etiqueta', roleMiddleware(['FARMACIA', 'POSTO_SAUDE']), farmaciaController.gerarEtiqueta);

// Rotas da Farmácia (Entregas Domiciliares)
router.get('/farmacia/entregas', farmaciaController.listarEntregas);
router.get('/farmacia/entregas/stats', farmaciaController.statsEntregas);
router.post('/farmacia/entregas', roleMiddleware(['FARMACIA', 'POSTO_SAUDE']), farmaciaController.criarEntrega);
router.patch('/farmacia/entregas/:id/coletar', roleMiddleware(['ENTREGADOR', 'FARMACIA', 'POSTO_SAUDE']), farmaciaController.confirmarColeta);
router.patch('/farmacia/entregas/:id/status', roleMiddleware(['ENTREGADOR', 'FARMACIA', 'POSTO_SAUDE']), farmaciaController.atualizarStatusEntrega);

// Rotas do Motorista (Entregador)
router.get('/motorista/dashboard', roleMiddleware(['ENTREGADOR']), motoristaController.dashboard);
router.get('/motorista/dashboard/grafico', roleMiddleware(['ENTREGADOR']), motoristaController.dashboardGrafico);
router.get('/motorista/coletas', roleMiddleware(['ENTREGADOR']), motoristaController.coletasPendentes);
router.get('/motorista/entregas', roleMiddleware(['ENTREGADOR']), motoristaController.entregasAtivas);
router.get('/motorista/historico', roleMiddleware(['ENTREGADOR']), motoristaController.historico);
router.patch('/motorista/coletas/:id/aceitar', roleMiddleware(['ENTREGADOR']), motoristaController.aceitarColeta);
router.patch('/motorista/entregas/:id/confirmar', roleMiddleware(['ENTREGADOR']), motoristaController.confirmarEntrega);
router.patch('/motorista/entregas/:id/devolver', roleMiddleware(['ENTREGADOR']), motoristaController.devolverEntrega);

// Rotas da Regulação
router.post('/regulacao', roleMiddleware(['POSTO_SAUDE']), uploadRegulacaoConfig.single('anexo'), regulacaoController.criar);
router.get('/regulacao', roleMiddleware(['POSTO_SAUDE', 'REGULADOR']), regulacaoController.listar);
router.get('/regulacao/consulta-rapida', roleMiddleware(['POSTO_SAUDE']), regulacaoController.consultaRapida);
router.get('/regulacao/:id', roleMiddleware(['POSTO_SAUDE', 'REGULADOR']), regulacaoController.detalhes);
router.patch('/regulacao/:id/agendar', roleMiddleware(['REGULADOR']), regulacaoController.agendar);
router.patch('/regulacao/:id/avisar-paciente', roleMiddleware(['POSTO_SAUDE']), regulacaoController.avisarPaciente);
router.patch('/regulacao/:id/status', regulacaoController.atualizarStatus);

// Rotas de Pacientes
router.post('/pacientes', roleMiddleware(['POSTO_SAUDE']), pacienteController.criar);
router.get('/pacientes', roleMiddleware(['POSTO_SAUDE', 'REGULADOR']), pacienteController.listar);
router.get('/pacientes/busca', roleMiddleware(['POSTO_SAUDE']), pacienteController.buscar);
router.get('/pacientes/:id', roleMiddleware(['POSTO_SAUDE', 'REGULADOR']), pacienteController.detalhes);
router.patch('/pacientes/:id', roleMiddleware(['POSTO_SAUDE']), pacienteController.atualizar);

export default router;
