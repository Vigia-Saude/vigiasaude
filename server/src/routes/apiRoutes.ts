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
import { ConfirmacaoController } from '../controllers/ConfirmacaoController';
import { ViagemTransporteController } from '../controllers/ViagemTransporteController';

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
const confirmacaoController = new ConfirmacaoController();
const viagemTransporteController = new ViagemTransporteController();


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
router.get('/cd/dashboard/stats', roleMiddleware(['GESTOR_ESTOQUE', 'COMPRADOR', 'SECRETARIO_SAUDE']), cdController.getDashboardStats);
router.post('/cd/notas-fiscais/xml', roleMiddleware(['GESTOR_ESTOQUE', 'COMPRADOR']), cdController.lerNfXml);
router.post('/cd/notas-fiscais', roleMiddleware(['GESTOR_ESTOQUE', 'COMPRADOR']), cdController.registrarNf);
router.get('/cd/notas-fiscais', roleMiddleware(['GESTOR_ESTOQUE', 'COMPRADOR', 'SECRETARIO_SAUDE']), cdController.listarNfs);
router.get('/cd/notas-fiscais/:id', roleMiddleware(['GESTOR_ESTOQUE', 'COMPRADOR', 'SECRETARIO_SAUDE']), cdController.obterNf);
router.post('/cd/notas-fiscais/:id/conferir', roleMiddleware(['GESTOR_ESTOQUE', 'COMPRADOR']), cdController.conferirNf);
router.get('/cd/estoque/detalhes', roleMiddleware(['GESTOR_ESTOQUE', 'COMPRADOR', 'FARMACIA', 'POSTO_SAUDE', 'SECRETARIO_SAUDE']), cdController.obterDetalhesMedicamento);
router.get('/cd/estoque', roleMiddleware(['GESTOR_ESTOQUE', 'COMPRADOR', 'FARMACIA', 'POSTO_SAUDE', 'SECRETARIO_SAUDE']), cdController.listarEstoque);
router.put('/cd/estoque/minimo', roleMiddleware(['GESTOR_ESTOQUE', 'COMPRADOR']), cdController.atualizarEstoqueMinimo);
router.post('/cd/recalls', roleMiddleware(['COMPRADOR', 'SECRETARIO_SAUDE']), cdController.registrarRecall);
router.get('/cd/recalls', roleMiddleware(['GESTOR_ESTOQUE', 'COMPRADOR', 'FARMACIA', 'POSTO_SAUDE', 'SECRETARIO_SAUDE']), cdController.listarRecalls);
router.patch('/cd/recalls/:id/encerrar', roleMiddleware(['COMPRADOR', 'SECRETARIO_SAUDE']), cdController.encerrarRecall);
router.get('/cd/alertas', roleMiddleware(['GESTOR_ESTOQUE', 'COMPRADOR', 'SECRETARIO_SAUDE']), cdController.listarAlertas);
router.patch('/cd/alertas/:id/lido', roleMiddleware(['GESTOR_ESTOQUE', 'COMPRADOR', 'SECRETARIO_SAUDE']), cdController.marcarAlertaLido);
router.get('/cd/auditoria', roleMiddleware(['GESTOR_ESTOQUE', 'COMPRADOR', 'SECRETARIO_SAUDE']), cdController.listarAuditoria);

// Rotas de Pedidos de Recomposição de Estoque (CD)
router.get('/cd/pedidos-reposicao', roleMiddleware(['GESTOR_ESTOQUE', 'ENTREGADOR', 'FARMACIA', 'POSTO_SAUDE', 'COMPRADOR', 'SECRETARIO_SAUDE']), pedidoReposicaoController.listar);
router.get('/cd/pedidos-reposicao/motoristas', roleMiddleware(['GESTOR_ESTOQUE', 'ENTREGADOR', 'FARMACIA', 'POSTO_SAUDE', 'COMPRADOR', 'SECRETARIO_SAUDE']), pedidoReposicaoController.listarMotoristas);
router.get('/cd/pedidos-reposicao/:id', roleMiddleware(['GESTOR_ESTOQUE', 'ENTREGADOR', 'FARMACIA', 'POSTO_SAUDE', 'COMPRADOR', 'SECRETARIO_SAUDE']), pedidoReposicaoController.detalhes);
router.post('/cd/pedidos-reposicao', roleMiddleware(['FARMACIA', 'POSTO_SAUDE', 'GESTOR_ESTOQUE', 'COMPRADOR']), pedidoReposicaoController.criar);
router.patch('/cd/pedidos-reposicao/:id/status', roleMiddleware(['GESTOR_ESTOQUE', 'ENTREGADOR', 'FARMACIA', 'POSTO_SAUDE', 'COMPRADOR']), pedidoReposicaoController.atualizarStatus);

// Rotas da Farmácia (Dispensação)
router.get('/farmacia/estoque', roleMiddleware(['FARMACIA', 'POSTO_SAUDE', 'COMPRADOR', 'GESTOR_ESTOQUE', 'SECRETARIO_SAUDE']), farmaciaController.buscarEstoque);
router.post('/farmacia/dispensar', roleMiddleware(['FARMACIA', 'POSTO_SAUDE']), farmaciaController.dispensar);
router.get('/farmacia/dispensacoes/recentes', roleMiddleware(['FARMACIA', 'POSTO_SAUDE', 'COMPRADOR', 'SECRETARIO_SAUDE']), farmaciaController.dispensacoesRecentes);
router.get('/farmacia/pacientes', roleMiddleware(['FARMACIA', 'POSTO_SAUDE', 'COMPRADOR', 'SECRETARIO_SAUDE']), farmaciaController.buscarPacientes);
router.post('/farmacia/validar-qr', roleMiddleware(['FARMACIA', 'POSTO_SAUDE']), farmaciaController.validarQrCode);
router.get('/farmacia/embalagem/:id/etiqueta', roleMiddleware(['FARMACIA', 'POSTO_SAUDE']), farmaciaController.gerarEtiqueta);

// Rotas da Farmácia (Entregas Domiciliares)
router.get('/farmacia/entregas', roleMiddleware(['FARMACIA', 'POSTO_SAUDE', 'COMPRADOR', 'ENTREGADOR', 'SECRETARIO_SAUDE']), farmaciaController.listarEntregas);
router.get('/farmacia/entregas/stats', roleMiddleware(['FARMACIA', 'POSTO_SAUDE', 'COMPRADOR', 'ENTREGADOR', 'SECRETARIO_SAUDE']), farmaciaController.statsEntregas);
router.post('/farmacia/entregas', roleMiddleware(['FARMACIA', 'POSTO_SAUDE']), farmaciaController.criarEntrega);
router.patch('/farmacia/entregas/:id/coletar', roleMiddleware(['ENTREGADOR', 'FARMACIA', 'POSTO_SAUDE']), farmaciaController.confirmarColeta);
router.patch('/farmacia/entregas/:id/status', roleMiddleware(['ENTREGADOR', 'FARMACIA', 'POSTO_SAUDE']), farmaciaController.atualizarStatusEntrega);

// Rotas do Motorista (Entregador e Transporte de Pacientes)
router.get('/motorista/dashboard', roleMiddleware(['ENTREGADOR', 'REGULADOR', 'SECRETARIO_SAUDE']), motoristaController.dashboard);
router.get('/motorista/dashboard/grafico', roleMiddleware(['ENTREGADOR', 'REGULADOR', 'SECRETARIO_SAUDE']), motoristaController.dashboardGrafico);
router.get('/motorista/coletas', roleMiddleware(['ENTREGADOR']), motoristaController.coletasPendentes);
router.get('/motorista/entregas', roleMiddleware(['ENTREGADOR']), motoristaController.entregasAtivas);
router.get('/motorista/historico', roleMiddleware(['ENTREGADOR']), motoristaController.historico);
router.patch('/motorista/coletas/:id/aceitar', roleMiddleware(['ENTREGADOR']), motoristaController.aceitarColeta);
router.patch('/motorista/entregas/:id/confirmar', roleMiddleware(['ENTREGADOR']), motoristaController.confirmarEntrega);
router.patch('/motorista/entregas/:id/devolver', roleMiddleware(['ENTREGADOR']), motoristaController.devolverEntrega);

// Rotas de Viagens e Transporte de Pacientes (TFD / Rotas com GPS e Assinatura Digital)
const TRANSPORTE_ROLES = ['ENTREGADOR', 'REGULADOR', 'SECRETARIO_SAUDE', 'POSTO_SAUDE', 'GESTOR_UBS', 'RECEPCIONISTA_UBS'];
router.get('/motorista/viagens', roleMiddleware(TRANSPORTE_ROLES), viagemTransporteController.listar);
router.post('/motorista/viagens', roleMiddleware(TRANSPORTE_ROLES), viagemTransporteController.criar);
router.get('/motorista/viagens/:id', roleMiddleware(TRANSPORTE_ROLES), viagemTransporteController.obterPorId);
router.patch('/motorista/viagens/:id/etapa', roleMiddleware(['ENTREGADOR']), viagemTransporteController.avancarEtapa);
router.post('/motorista/viagens/:id/gps', roleMiddleware(['ENTREGADOR']), viagemTransporteController.registrarPontoGps);
router.patch('/motorista/viagens/passageiro/:passageiroId', roleMiddleware(['ENTREGADOR']), viagemTransporteController.atualizarStatusPassageiro);
router.get('/motorista/viagens/:id/relatorio', roleMiddleware(TRANSPORTE_ROLES), viagemTransporteController.relatorio);


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
router.get('/regulacao/medicos', roleMiddleware(UBS_PROFILES), regulacaoController.listarMedicos);

// Rotas de Importação de PDF (SES-MS) e Confirmações WhatsApp (Apenas REGULADOR)
// Precisam vir ANTES de /regulacao/:id, senão "imports" é capturado como :id
router.post('/regulacao/imports/upload', roleMiddleware(['REGULADOR']), uploadRegulacaoConfig.single('file'), importPdfController.uploadPdf);
router.get('/regulacao/imports', roleMiddleware(['REGULADOR']), importPdfController.listarImports);
router.get('/regulacao/imports/:id', roleMiddleware(['REGULADOR']), importPdfController.obterImport);
router.get('/regulacao/imports/:id/pdf-url', roleMiddleware(['REGULADOR']), importPdfController.obterPdfUrl);
router.get('/regulacao/imports/:id/pdf', roleMiddleware(['REGULADOR']), importPdfController.servirPdf);
router.post('/regulacao/imports/:importId/rows', roleMiddleware(['REGULADOR']), importPdfController.criarRowManual);
router.patch('/regulacao/imports/:importId/rows/:rowId', roleMiddleware(['REGULADOR']), importPdfController.atualizarRow);
router.patch('/regulacao/imports/:importId/rows-bulk', roleMiddleware(['REGULADOR']), importPdfController.bulkAtualizarRows);
router.post('/regulacao/imports/:importId/approve', roleMiddleware(['REGULADOR']), importPdfController.aprovarImport);

router.get('/regulacao/whatsapp/filas', roleMiddleware(['REGULADOR']), filaWhatsappController.obterResumoFilas);
router.get('/regulacao/whatsapp/filas/detalhes', roleMiddleware(['REGULADOR']), filaWhatsappController.detalhesFila);
router.post('/regulacao/whatsapp/filas/disparar-proximo', roleMiddleware(['REGULADOR']), filaWhatsappController.dispararProximo);

// Módulo de Confirmação Automatizada (Apenas REGULADOR)
// Precisam vir ANTES de /regulacao/:id, senão os segmentos viram :id
router.get('/regulacao/config', roleMiddleware(['REGULADOR']), confirmacaoController.obterConfig);
router.patch('/regulacao/config', roleMiddleware(['REGULADOR']), confirmacaoController.salvarConfig);
router.get('/regulacao/confirmacao/filas/detalhes', roleMiddleware(['REGULADOR']), confirmacaoController.detalhes);
router.post('/regulacao/confirmacao/disparar-manual', roleMiddleware(['REGULADOR']), confirmacaoController.dispararManual);
router.post('/regulacao/confirmacao/convocar/:queueEntryId', roleMiddleware(['REGULADOR']), confirmacaoController.convocar);
router.post('/regulacao/confirmacao/simular-resposta', roleMiddleware(['REGULADOR']), confirmacaoController.simularResposta);
router.get('/regulacao/pacientes/:id/absenteismo', roleMiddleware(['REGULADOR']), confirmacaoController.absenteismo);
router.get('/regulacao/slots', roleMiddleware(['REGULADOR']), confirmacaoController.listarSlots);
router.put('/regulacao/slots', roleMiddleware(['REGULADOR']), confirmacaoController.salvarSlot);

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
router.patch('/regulacao/:id/status', roleMiddleware([...UBS_PROFILES, 'REGULADOR', 'SECRETARIO_SAUDE']), regulacaoController.atualizarStatus);

export default router;


