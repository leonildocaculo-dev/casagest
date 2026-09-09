<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ImovelController;
use Illuminate\Support\Facades\Route;

// Health Check
Route::get('/health', [\App\Http\Controllers\Api\HealthCheckController::class, 'check']);

// Rotas públicas (com rate limit para proteção)
Route::middleware('throttle:10,1')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

// Verificação de E-mail
Route::post('/email/verify', [AuthController::class, 'verifyEmail'])->name('verification.verify');
Route::middleware(['auth:sanctum', 'throttle:6,1'])->post('/email/verification-notification', [AuthController::class, 'resendVerificationEmail'])->name('verification.send');

// Imóveis — rotas públicas (listagem e detalhes de publicados)
Route::get('/imoveis', [ImovelController::class, 'index']);
Route::get('/imoveis/{imovel}', [ImovelController::class, 'show']);

// Contacto e Webhooks (Públicos com throttle)
Route::middleware('throttle:20,1')->group(function () {
    Route::post('/contacto', [\App\Http\Controllers\Api\ContactoController::class, 'store']);
    Route::post('/webhooks/pagamentos/referencia', [\App\Http\Controllers\Api\WebhookPagamentoController::class, 'processarReferencia']);
    Route::post('/webhooks/autentique', [\App\Http\Controllers\Api\WebhookAutentiqueController::class, 'handle']);
});

// Rotas protegidas por Sanctum
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/perfil', [AuthController::class, 'updateProfile']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Imóveis — CRUD autenticado (Listagem e Get)
    Route::get('/meus-imoveis', [ImovelController::class, 'meusImoveis']);

    // Favoritos
    Route::get('/favoritos', [\App\Http\Controllers\Api\FavoritoController::class, 'index']);
    Route::post('/imoveis/{imovel}/favorito', [\App\Http\Controllers\Api\FavoritoController::class, 'toggle']);

    // Notificações
    Route::get('/notificacoes', [\App\Http\Controllers\Api\NotificationController::class, 'index']);
    Route::post('/notificacoes/mark-all-read', [\App\Http\Controllers\Api\NotificationController::class, 'markAllAsRead']);
    Route::post('/notificacoes/{id}/mark-read', [\App\Http\Controllers\Api\NotificationController::class, 'markAsRead']);

    // Proprietário Dashboard
    Route::get('/proprietario/stats', [\App\Http\Controllers\Api\ProprietarioController::class, 'stats']);

    // Admin — Gestão de imóveis & Dashboard & Audit Logs & Relatórios & Contactos
    Route::get('/admin/dashboard', [\App\Http\Controllers\Api\AdminController::class, 'dashboard']);
    Route::get('/admin/utilizadores', [\App\Http\Controllers\Api\AdminController::class, 'utilizadores']);
    Route::post('/admin/utilizadores/{targetUser}/status', [\App\Http\Controllers\Api\AdminController::class, 'toggleStatus']);
    Route::get('/admin/audit-logs', [\App\Http\Controllers\Api\AdminController::class, 'auditLogs']);
    Route::get('/admin/contactos', [\App\Http\Controllers\Api\ContactoController::class, 'index']);
    Route::get('/admin/relatorios/imoveis/export', [\App\Http\Controllers\Api\AdminController::class, 'exportImoveis']);
    Route::get('/admin/relatorios/imoveis/pdf', [\App\Http\Controllers\Api\AdminController::class, 'exportImoveisPdf']);
    Route::get('/admin/relatorios/pagamentos/export', [\App\Http\Controllers\Api\AdminController::class, 'exportPagamentos']);
    Route::get('/admin/relatorios/pagamentos/pdf', [\App\Http\Controllers\Api\AdminController::class, 'exportPagamentosPdf']);
    Route::get('/admin/imoveis', [ImovelController::class, 'adminIndex']);
    Route::post('/imoveis/{imovel}/aprovar', [ImovelController::class, 'aprovar']);

    // Propostas (Get)
    Route::get('/propostas', [\App\Http\Controllers\Api\PropostaController::class, 'index']);
    Route::get('/propostas/{proposta}', [\App\Http\Controllers\Api\PropostaController::class, 'show']);

    // Chat Propostas (Get)
    Route::get('/propostas/{proposta}/mensagens', [\App\Http\Controllers\Api\MensagemController::class, 'index']);

    // Contratos (Get)
    Route::get('/contratos', [\App\Http\Controllers\Api\ContratoController::class, 'index']);
    Route::get('/contratos/{contrato}', [\App\Http\Controllers\Api\ContratoController::class, 'show']);
    Route::get('/contratos/{contrato}/pdf', [\App\Http\Controllers\Api\ContratoController::class, 'downloadPdf']);

    // Pagamentos (Get)
    Route::get('/pagamentos', [\App\Http\Controllers\Api\PagamentoController::class, 'index']);

    // Rotas protegidas por Sanctum E Verified
    Route::middleware('verified')->group(function () {
        // Imóveis — CRUD autenticado (Criação/Edição requer verificação)
        Route::post('/imoveis', [ImovelController::class, 'store']);
        Route::put('/imoveis/{imovel}', [ImovelController::class, 'update']);
        Route::delete('/imoveis/{imovel}', [ImovelController::class, 'destroy']);
        
        // Imóveis — Upload de imagens
        Route::post('/imoveis/{imovel}/imagens', [ImovelController::class, 'uploadImagens']);
        Route::delete('/imoveis/{imovel}/imagens/{imagem}', [ImovelController::class, 'removerImagem']);

        // Propostas
        Route::post('/propostas', [\App\Http\Controllers\Api\PropostaController::class, 'store']);
        Route::post('/propostas/{proposta}/responder', [\App\Http\Controllers\Api\PropostaController::class, 'responder']);
        Route::post('/propostas/{proposta}/mensagens', [\App\Http\Controllers\Api\MensagemController::class, 'store']);

        // Contratos
        Route::post('/contratos', [\App\Http\Controllers\Api\ContratoController::class, 'store']);
        Route::post('/contratos/{contrato}/estado', [\App\Http\Controllers\Api\ContratoController::class, 'updateEstado']);

        // Pagamentos
        Route::post('/pagamentos', [\App\Http\Controllers\Api\PagamentoController::class, 'store']);
        Route::post('/pagamentos/{pagamento}/comprovativo', [\App\Http\Controllers\Api\PagamentoController::class, 'uploadComprovativo']);
        Route::post('/pagamentos/{pagamento}/validar', [\App\Http\Controllers\Api\PagamentoController::class, 'validarComprovativo']);
    });
});
