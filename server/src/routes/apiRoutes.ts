import { Router } from 'express';
import { PedidoController } from '../controllers/PedidoController';
import { AuditoriaController } from '../controllers/AuditoriaController';
import { AtaController } from '../controllers/AtaController';
import { CatmatController } from '../controllers/CatmatController';
import { PrecoReferenciaController } from '../controllers/PrecoReferenciaController';
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

import { ImportPdfController } from '../controllers/ImportPdfController';
import { FilaWhatsappController } from '../controllers/FilaWhatsappController';
import { QueueController } from '../controllers/QueueController';

const router = Router();
const pedidoController = new PedidoController();
const auditoriaController = new AuditoriaController();
const ataController = new AtaController();
const catmatController = new CatmatController();
const precoReferenciaController = new PrecoReferenciaController();
const uploadController = new UploadController();
const fornecedorController = new FornecedorController();
const dashboardController = new DashboardController();
const cdController = new CdController();
const pedidoReposicaoController = new PedidoReposicaoController();
const farmaciaController = new FarmaciaController();
const motoristaController = new MotoristaController();
const regulacaoController = new RegulacaoController();
const pacienteController = new PacienteController();
const importPdfController = new ImportPdfController();
const filaWhatsappController = new FilaWhatsappController();
const queueController = new QueueController();


// Todas as rotas da API requerem autenticação
router.use(authMiddleware);

import { UnidadeController } from '../controllers/UnidadeController';

const unidadeController = new UnidadeController();

// Rotas de Unidades de Saúde
router.get('/unidades', unidadeController.listar);
router.get('/unidades/:id', unidadeController.obterPorId);
router.post('/unidades', unidadeController.criar);
router.put('/unidades/:id', unidadeController.atualizar);
router.patch('/unidades/:id/toggle-status', unidadeController.toggleStatus);

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

// Preços oficiais de referência (BPS / CMED)
router.get('/precos/referencia', precoReferenciaController.obter);

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
router.get('/cd/dashboard/stats', cdController.getDashboardStats);
router.post('/cd/notas-fiscais/xml', roleMiddleware(['GESTOR_ESTOQUE']), cdController.lerNfXml);
router.post('/cd/notas-fiscais', roleMiddleware(['GESTOR_ESTOQUE']), cdController.registrarNf);
router.get('/cd/notas-fiscais', cdController.listarNfs);
router.get('/cd/notas-fiscais/:id', cdController.obterNf);
router.post('/cd/notas-fiscais/:id/conferir', roleMiddleware(['GESTOR_ESTOQUE']), cdController.conferirNf);
router.get('/cd/estoque/detalhes', cdController.obterDetalhesMedicamento);
router.get('/cd/estoque', cdController.listarEstoque);
router.put('/cd/estoque/minimo', roleMiddleware(['GESTOR_ESTOQUE']), cdController.atualizarEstoqueMinimo);
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

// Rotas de Pacientes
const UBS_PROFILES = ['POSTO_SAUDE', 'GESTOR_UBS', 'RECEPCIONISTA_UBS', 'MEDICO'];
router.post('/pacientes', roleMiddleware(UBS_PROFILES), pacienteController.criar.bind(pacienteController));
router.get('/pacientes', roleMiddleware(UBS_PROFILES), pacienteController.listar.bind(pacienteController));
router.get('/pacientes/busca', roleMiddleware(UBS_PROFILES), pacienteController.buscar.bind(pacienteController));
router.get('/pacientes/:id', roleMiddleware(UBS_PROFILES), pacienteController.detalhes.bind(pacienteController));
router.patch('/pacientes/:id', roleMiddleware(['POSTO_SAUDE', 'GESTOR_UBS', 'RECEPCIONISTA_UBS']), pacienteController.atualizar.bind(pacienteController));

// Rotas da Regulação
router.post('/regulacao', roleMiddleware(UBS_PROFILES), uploadRegulacaoConfig.single('anexo'), regulacaoController.criar);
router.get('/regulacao', roleMiddleware([...UBS_PROFILES, 'REGULADOR']), regulacaoController.listar);
router.get('/regulacao/consulta-rapida', roleMiddleware(UBS_PROFILES), regulacaoController.consultaRapida);

// Rotas de Importação de PDF (SES-MS) e Confirmações WhatsApp (Apenas REGULADOR)
// Precisam vir ANTES de /regulacao/:id, senão "imports" é capturado como :id
router.post('/regulacao/imports/upload', roleMiddleware(['REGULADOR']), uploadRegulacaoConfig.single('file'), importPdfController.uploadPdf);
router.get('/regulacao/imports', roleMiddleware(['REGULADOR']), importPdfController.listarImports);
router.get('/regulacao/imports/:id', roleMiddleware(['REGULADOR']), importPdfController.obterImport);
router.get('/regulacao/imports/:id/pdf-url', roleMiddleware(['REGULADOR']), importPdfController.obterPdfUrl);
router.get('/regulacao/imports/:id/pdf', roleMiddleware(['REGULADOR']), importPdfController.servirPdf);
router.post('/regulacao/imports/:importId/rows', roleMiddleware(['REGULADOR']), importPdfController.criarRowManual);
router.patch('/regulacao/imports/:importId/rows/:rowId', roleMiddleware(['REGULADOR']), importPdfController.atualizarRow);
router.post('/regulacao/imports/:importId/approve', roleMiddleware(['REGULADOR']), importPdfController.aprovarImport);

router.get('/regulacao/whatsapp/filas', roleMiddleware(['REGULADOR']), filaWhatsappController.obterResumoFilas);
router.get('/regulacao/whatsapp/filas/detalhes', roleMiddleware(['REGULADOR']), filaWhatsappController.detalhesFila);
router.post('/regulacao/whatsapp/filas/disparar-proximo', roleMiddleware(['REGULADOR']), filaWhatsappController.dispararProximo);

// Rotas de Gestão de Filas por Procedimento / Especialidade (Apenas REGULADOR)
// Também precisam vir ANTES de /regulacao/:id, senão "queues" é capturado como :id
router.get('/regulacao/queues', roleMiddleware(['REGULADOR']), queueController.listarQueues);
router.get('/regulacao/queues/:procedureId', roleMiddleware(['REGULADOR']), queueController.detalhesQueue);
router.post('/regulacao/queues/:procedureId/resend-all', roleMiddleware(['REGULADOR']), queueController.resendAll);
router.post('/regulacao/queues/entries/:entryId/resend', roleMiddleware(['REGULADOR']), queueController.resendSingle);

router.get('/regulacao/:id', roleMiddleware([...UBS_PROFILES, 'REGULADOR']), regulacaoController.detalhes);
router.patch('/regulacao/:id', roleMiddleware(UBS_PROFILES), regulacaoController.atualizar);
router.patch('/regulacao/:id/agendar', roleMiddleware(['REGULADOR']), regulacaoController.agendar);
router.patch('/regulacao/:id/avisar-paciente', roleMiddleware(UBS_PROFILES), regulacaoController.avisarPaciente);
router.patch('/regulacao/:id/status', regulacaoController.atualizarStatus);

export default router;


