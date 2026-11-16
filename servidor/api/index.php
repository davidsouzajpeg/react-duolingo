<?php
/**
 * API do Vendê: contas, senha, progresso e painel do gestor.
 *
 * Um arquivo só, PHP puro + PDO (MySQL na hospedagem; SQLite nos testes).
 * As credenciais ficam em config.php, que existe só no servidor e não vai
 * para o repositório (veja config.exemplo.php).
 *
 * Chamadas: /api/index.php?r=<rota>, sempre JSON.
 */
declare(strict_types=1);

const SENHA_INICIAL = '1234';
const SESSAO_DIAS = 30;
const MAX_TENTATIVAS = 8;        // erros de senha seguidos
const BLOQUEIO_MINUTOS = 15;
const MAX_PROGRESSO_BYTES = 300000;
const COOKIE = 'vende_sessao';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function responder(int $status, array $dados): never {
    http_response_code($status);
    echo json_encode($dados, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}
function erro(int $status, string $codigo, string $mensagem): never {
    responder($status, ['erro' => $codigo, 'mensagem' => $mensagem]);
}

$configPath = getenv('VENDE_CONFIG') ?: __DIR__ . '/config.php';
if (!is_file($configPath)) erro(500, 'sem_config', 'Servidor não configurado.');
$config = require $configPath;

try {
    $db = new PDO($config['dsn'], $config['user'] ?? null, $config['password'] ?? null, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
} catch (Throwable $e) {
    erro(500, 'banco', 'Não foi possível conectar ao banco de dados.');
}
$mysql = $db->getAttribute(PDO::ATTR_DRIVER_NAME) === 'mysql';

/* --------------------------------- Tabelas -------------------------------- */

function criarTabelas(PDO $db, bool $mysql): void {
    $id = $mysql ? 'INT UNSIGNED AUTO_INCREMENT PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT';
    $fim = $mysql ? ' ENGINE=InnoDB DEFAULT CHARSET=utf8mb4' : '';
    $texto = $mysql ? 'MEDIUMTEXT' : 'TEXT';
    $db->exec("CREATE TABLE IF NOT EXISTS vende_usuarios (
        id $id,
        usuario VARCHAR(40) NOT NULL UNIQUE,
        nome VARCHAR(80) NOT NULL,
        papel VARCHAR(10) NOT NULL DEFAULT 'vendedor',
        senha_hash VARCHAR(255) NOT NULL,
        trocar_senha TINYINT NOT NULL DEFAULT 1,
        ativo TINYINT NOT NULL DEFAULT 1,
        criado_em DATETIME NOT NULL,
        ultimo_acesso DATETIME NULL
    )$fim");
    $db->exec("CREATE TABLE IF NOT EXISTS vende_sessoes (
        token_hash CHAR(64) PRIMARY KEY,
        usuario_id INT NOT NULL,
        expira_em DATETIME NOT NULL
    )$fim");
    $db->exec("CREATE TABLE IF NOT EXISTS vende_progresso (
        usuario_id INT PRIMARY KEY,
        estado $texto NOT NULL,
        atualizado_em DATETIME NOT NULL
    )$fim");
    $db->exec("CREATE TABLE IF NOT EXISTS vende_conteudo (
        id INT PRIMARY KEY,
        dados $texto NOT NULL,
        atualizado_em DATETIME NOT NULL
    )$fim");
    $db->exec("CREATE TABLE IF NOT EXISTS vende_tentativas (
        chave VARCHAR(80) PRIMARY KEY,
        erros INT NOT NULL,
        ultima DATETIME NOT NULL
    )$fim");
}

/* -------------------------------- Utilidades ------------------------------ */

function agora(int $maisSegundos = 0): string { return gmdate('Y-m-d H:i:s', time() + $maisSegundos); }

function corpo(): array {
    $bruto = file_get_contents('php://input') ?: '';
    if (strlen($bruto) > MAX_PROGRESSO_BYTES + 2000) erro(413, 'grande_demais', 'Dados grandes demais.');
    $dados = json_decode($bruto, true);
    return is_array($dados) ? $dados : [];
}

/** escrita só com o cabeçalho próprio do app: um site de fora não consegue enviá-lo */
function exigirEscrita(): void {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') erro(405, 'metodo', 'Use POST.');
    if (($_SERVER['HTTP_X_VENDE'] ?? '') !== '1') erro(403, 'origem', 'Requisição recusada.');
}

function usuarioPublico(array $u): array {
    return [
        'id' => (int) $u['id'],
        'usuario' => $u['usuario'],
        'nome' => $u['nome'],
        'papel' => $u['papel'],
        'trocarSenha' => (bool) $u['trocar_senha'],
    ];
}

function gravarCookie(string $token, int $expira): void {
    $seguro = ($_SERVER['HTTPS'] ?? '') !== '' || ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https';
    setcookie(COOKIE, $token, [
        'expires' => $expira, 'path' => '/', 'secure' => $seguro, 'httponly' => true, 'samesite' => 'Strict',
    ]);
}

function abrirSessao(PDO $db, int $usuarioId): void {
    $token = bin2hex(random_bytes(32));
    $db->prepare('INSERT INTO vende_sessoes (token_hash, usuario_id, expira_em) VALUES (?, ?, ?)')
       ->execute([hash('sha256', $token), $usuarioId, agora(SESSAO_DIAS * 86400)]);
    gravarCookie($token, time() + SESSAO_DIAS * 86400);
}

function usuarioAtual(PDO $db): ?array {
    $token = $_COOKIE[COOKIE] ?? '';
    if (!is_string($token) || strlen($token) !== 64) return null;
    $q = $db->prepare('SELECT u.* FROM vende_sessoes s JOIN vende_usuarios u ON u.id = s.usuario_id
                       WHERE s.token_hash = ? AND s.expira_em > ? AND u.ativo = 1');
    $q->execute([hash('sha256', $token), agora()]);
    return $q->fetch() ?: null;
}

function exigirLogin(PDO $db, bool $permitirTroca = false): array {
    $u = usuarioAtual($db);
    if (!$u) erro(401, 'sem_sessao', 'Entre com seu usuário e senha.');
    if ($u['trocar_senha'] && !$permitirTroca) erro(403, 'trocar_senha', 'Crie sua senha antes de continuar.');
    return $u;
}

function exigirGestor(PDO $db): array {
    $u = exigirLogin($db);
    if ($u['papel'] !== 'gestor') erro(403, 'sem_permissao', 'Área restrita ao gestor.');
    return $u;
}

function normalizarUsuario(mixed $valor): string {
    $u = strtolower(trim(is_string($valor) ? $valor : ''));
    if (!preg_match('/^[a-z0-9._-]{3,30}$/', $u)) {
        erro(422, 'usuario_invalido', 'O usuário deve ter de 3 a 30 caracteres: letras minúsculas, números, ponto, hífen ou sublinhado.');
    }
    return $u;
}

function validarSenhaNova(mixed $senha): string {
    if (!is_string($senha) || strlen($senha) < 6) erro(422, 'senha_curta', 'A senha precisa ter pelo menos 6 caracteres.');
    if (strlen($senha) > 100) erro(422, 'senha_longa', 'Senha longa demais.');
    if ($senha === SENHA_INICIAL || preg_match('/^(.)\1+$/', $senha) || in_array($senha, ['123456', '1234567', '12345678', '654321', 'senha123'], true)) {
        erro(422, 'senha_fraca', 'Escolha uma senha menos óbvia.');
    }
    return $senha;
}

function encerrarSessoes(PDO $db, int $usuarioId): void {
    $db->prepare('DELETE FROM vende_sessoes WHERE usuario_id = ?')->execute([$usuarioId]);
}

/* ---------------------------------- Rotas --------------------------------- */

$rota = $_GET['r'] ?? '';

try {
    switch ($rota) {
        /* ----- instalação: cria as tabelas e o primeiro gestor (uma vez só) ----- */
        case 'instalar': {
            exigirEscrita();
            $in = corpo();
            if (empty($config['chave_instalacao']) || !hash_equals((string) $config['chave_instalacao'], (string) ($in['chave'] ?? ''))) {
                erro(403, 'chave', 'Chave de instalação inválida.');
            }
            criarTabelas($db, $mysql);
            $existe = (int) $db->query("SELECT COUNT(*) FROM vende_usuarios WHERE papel = 'gestor'")->fetchColumn();
            if ($existe > 0) responder(200, ['ok' => true, 'gestor' => 'ja_existe']);
            $usuario = normalizarUsuario($in['usuario'] ?? '');
            $senha = (string) ($in['senha'] ?? '');
            if (strlen($senha) < 8) erro(422, 'senha_curta', 'Senha provisória do gestor: mínimo de 8 caracteres.');
            $db->prepare("INSERT INTO vende_usuarios (usuario, nome, papel, senha_hash, trocar_senha, ativo, criado_em) VALUES (?, ?, 'gestor', ?, 1, 1, ?)")
               ->execute([$usuario, trim((string) ($in['nome'] ?? 'Gestor')), password_hash($senha, PASSWORD_DEFAULT), agora()]);
            responder(200, ['ok' => true, 'gestor' => 'criado']);
        }

        case 'entrar': {
            exigirEscrita();
            $in = corpo();
            $usuario = strtolower(trim((string) ($in['usuario'] ?? '')));
            $senha = (string) ($in['senha'] ?? '');
            $chave = substr($usuario, 0, 40) . '|' . ($_SERVER['REMOTE_ADDR'] ?? '');
            $chave = substr($chave, 0, 80);

            $t = $db->prepare('SELECT erros, ultima FROM vende_tentativas WHERE chave = ?');
            $t->execute([$chave]);
            $tent = $t->fetch();
            if ($tent && (int) $tent['erros'] >= MAX_TENTATIVAS && strtotime($tent['ultima'] . ' UTC') > time() - BLOQUEIO_MINUTOS * 60) {
                erro(429, 'bloqueado', 'Muitas tentativas. Aguarde ' . BLOQUEIO_MINUTOS . ' minutos e tente de novo.');
            }

            $q = $db->prepare('SELECT * FROM vende_usuarios WHERE usuario = ?');
            $q->execute([$usuario]);
            $u = $q->fetch();
            // confere a senha mesmo sem usuário, para o tempo de resposta não entregar quem existe
            $hash = $u['senha_hash'] ?? '$2y$10$abcdefghijklmnopqrstuuJ8m1mZb1mZb1mZb1mZb1mZb1mZb1mZb1m';
            $ok = password_verify($senha, $hash) && $u && (int) $u['ativo'] === 1;
            if (!$ok) {
                $expirou = !$tent || strtotime($tent['ultima'] . ' UTC') <= time() - BLOQUEIO_MINUTOS * 60;
                $erros = $expirou ? 1 : (int) $tent['erros'] + 1;
                $db->prepare('DELETE FROM vende_tentativas WHERE chave = ?')->execute([$chave]);
                $db->prepare('INSERT INTO vende_tentativas (chave, erros, ultima) VALUES (?, ?, ?)')->execute([$chave, $erros, agora()]);
                erro(401, 'credenciais', 'Usuário ou senha incorretos.');
            }
            $db->prepare('DELETE FROM vende_tentativas WHERE chave = ?')->execute([$chave]);
            $db->prepare('DELETE FROM vende_sessoes WHERE expira_em < ?')->execute([agora()]);
            $db->prepare('UPDATE vende_usuarios SET ultimo_acesso = ? WHERE id = ?')->execute([agora(), $u['id']]);
            abrirSessao($db, (int) $u['id']);
            responder(200, ['usuario' => usuarioPublico($u)]);
        }

        case 'sair': {
            exigirEscrita();
            $token = $_COOKIE[COOKIE] ?? '';
            if (is_string($token) && $token !== '') {
                $db->prepare('DELETE FROM vende_sessoes WHERE token_hash = ?')->execute([hash('sha256', $token)]);
            }
            gravarCookie('', time() - 3600);
            responder(200, ['ok' => true]);
        }

        case 'eu': {
            $u = usuarioAtual($db);
            responder(200, ['usuario' => $u ? usuarioPublico($u) : null]);
        }

        case 'trocar-senha': {
            exigirEscrita();
            $u = exigirLogin($db, true);
            $in = corpo();
            if (!password_verify((string) ($in['atual'] ?? ''), $u['senha_hash'])) erro(401, 'senha_atual', 'A senha atual não confere.');
            $nova = validarSenhaNova($in['nova'] ?? null);
            $db->prepare('UPDATE vende_usuarios SET senha_hash = ?, trocar_senha = 0 WHERE id = ?')
               ->execute([password_hash($nova, PASSWORD_DEFAULT), $u['id']]);
            // derruba as outras sessões e abre uma nova para este aparelho
            encerrarSessoes($db, (int) $u['id']);
            abrirSessao($db, (int) $u['id']);
            $u['trocar_senha'] = 0;
            responder(200, ['usuario' => usuarioPublico($u)]);
        }

        case 'progresso': {
            $u = exigirLogin($db);
            if ($_SERVER['REQUEST_METHOD'] === 'GET') {
                $q = $db->prepare('SELECT estado, atualizado_em FROM vende_progresso WHERE usuario_id = ?');
                $q->execute([$u['id']]);
                $p = $q->fetch();
                responder(200, ['estado' => $p ? json_decode($p['estado'], true) : null, 'atualizadoEm' => $p['atualizado_em'] ?? null]);
            }
            exigirEscrita();
            $in = corpo();
            if (!isset($in['estado']) || !is_array($in['estado'])) erro(422, 'estado', 'Progresso inválido.');
            $json = json_encode($in['estado'], JSON_UNESCAPED_UNICODE);
            if ($json === false || strlen($json) > MAX_PROGRESSO_BYTES) erro(413, 'grande_demais', 'Progresso grande demais.');
            $existe = $db->prepare('SELECT 1 FROM vende_progresso WHERE usuario_id = ?');
            $existe->execute([$u['id']]);
            if ($existe->fetchColumn()) {
                $db->prepare('UPDATE vende_progresso SET estado = ?, atualizado_em = ? WHERE usuario_id = ?')->execute([$json, agora(), $u['id']]);
            } else {
                $db->prepare('INSERT INTO vende_progresso (usuario_id, estado, atualizado_em) VALUES (?, ?, ?)')->execute([$u['id'], $json, agora()]);
            }
            responder(200, ['ok' => true]);
        }

        /* unidades criadas pelo gestor: vendedor recebe só as publicadas */
        case 'conteudo': {
            $u = exigirLogin($db);
            criarTabelas($db, $mysql);
            $linha = $db->query('SELECT dados, atualizado_em FROM vende_conteudo WHERE id = 1')->fetch();
            $dados = $linha ? json_decode($linha['dados'], true) : null;
            $unidades = is_array($dados['unidades'] ?? null) ? $dados['unidades'] : [];
            if ($u['papel'] !== 'gestor') {
                $unidades = array_values(array_filter($unidades, fn ($x) => !empty($x['publicada'])));
            }
            responder(200, ['unidades' => $unidades, 'atualizadoEm' => $linha['atualizado_em'] ?? null]);
        }

        case 'gestor/conteudo': {
            exigirEscrita();
            exigirGestor($db);
            criarTabelas($db, $mysql);
            $in = corpo();
            if (!isset($in['unidades']) || !is_array($in['unidades']) || !array_is_list($in['unidades'])) erro(422, 'conteudo', 'Conteúdo inválido.');
            // outra pessoa salvou depois que este painel foi aberto: não sobrescreve
            $atual = $db->query('SELECT atualizado_em FROM vende_conteudo WHERE id = 1')->fetchColumn() ?: null;
            if (($in['base'] ?? null) !== $atual) erro(409, 'conflito', 'O conteúdo foi alterado em outro aparelho. Recarregue a página antes de salvar.');
            foreach ($in['unidades'] as $un) {
                if (!is_array($un) || !preg_match('/^c[a-z0-9]{4,20}$/', (string) ($un['id'] ?? '')) || !is_array($un['lessons'] ?? null)) erro(422, 'conteudo', 'Unidade inválida.');
                foreach ($un['lessons'] as $li) {
                    if (!is_array($li) || !preg_match('/^c[a-z0-9]{4,20}-l[a-z0-9]{1,12}$/', (string) ($li['id'] ?? '')) || !is_array($li['questions'] ?? null)) erro(422, 'conteudo', 'Lição inválida.');
                }
            }
            $json = json_encode(['unidades' => $in['unidades']], JSON_UNESCAPED_UNICODE);
            if ($json === false || strlen($json) > MAX_PROGRESSO_BYTES) erro(413, 'grande_demais', 'Conteúdo grande demais.');
            $quando = agora();
            if ($quando === $atual) $quando = agora(1);
            $db->prepare('DELETE FROM vende_conteudo WHERE id = 1')->execute();
            $db->prepare('INSERT INTO vende_conteudo (id, dados, atualizado_em) VALUES (1, ?, ?)')->execute([$json, $quando]);
            responder(200, ['ok' => true, 'atualizadoEm' => $quando]);
        }

        /* ------------------------------- gestor ------------------------------- */
        case 'gestor/usuarios': {
            exigirGestor($db);
            $linhas = $db->query('SELECT u.id, u.usuario, u.nome, u.papel, u.trocar_senha, u.ativo, u.criado_em, u.ultimo_acesso,
                                         p.estado, p.atualizado_em
                                  FROM vende_usuarios u LEFT JOIN vende_progresso p ON p.usuario_id = u.id
                                  ORDER BY u.ativo DESC, u.nome')->fetchAll();
            responder(200, ['usuarios' => array_map(fn ($l) => [
                'id' => (int) $l['id'], 'usuario' => $l['usuario'], 'nome' => $l['nome'], 'papel' => $l['papel'],
                'trocarSenha' => (bool) $l['trocar_senha'], 'ativo' => (bool) $l['ativo'],
                'criadoEm' => $l['criado_em'], 'ultimoAcesso' => $l['ultimo_acesso'],
                'progressoEm' => $l['atualizado_em'],
                'estado' => $l['estado'] ? json_decode($l['estado'], true) : null,
            ], $linhas)]);
        }

        case 'gestor/criar': {
            exigirEscrita();
            exigirGestor($db);
            $in = corpo();
            $usuario = normalizarUsuario($in['usuario'] ?? '');
            $nome = trim((string) ($in['nome'] ?? ''));
            if ($nome === '' || mb_strlen($nome) > 80) erro(422, 'nome', 'Informe o nome (até 80 caracteres).');
            $papel = ($in['papel'] ?? '') === 'gestor' ? 'gestor' : 'vendedor';
            $q = $db->prepare('SELECT 1 FROM vende_usuarios WHERE usuario = ?');
            $q->execute([$usuario]);
            if ($q->fetchColumn()) erro(409, 'usuario_existe', 'Já existe alguém com esse usuário.');
            $db->prepare('INSERT INTO vende_usuarios (usuario, nome, papel, senha_hash, trocar_senha, ativo, criado_em) VALUES (?, ?, ?, ?, 1, 1, ?)')
               ->execute([$usuario, $nome, $papel, password_hash(SENHA_INICIAL, PASSWORD_DEFAULT), agora()]);
            responder(200, ['ok' => true, 'senhaInicial' => SENHA_INICIAL]);
        }

        case 'gestor/redefinir-senha': {
            exigirEscrita();
            exigirGestor($db);
            $id = (int) (corpo()['id'] ?? 0);
            $n = $db->prepare('UPDATE vende_usuarios SET senha_hash = ?, trocar_senha = 1 WHERE id = ?');
            $n->execute([password_hash(SENHA_INICIAL, PASSWORD_DEFAULT), $id]);
            if ($n->rowCount() === 0) erro(404, 'nao_encontrado', 'Usuário não encontrado.');
            encerrarSessoes($db, $id);
            responder(200, ['ok' => true, 'senhaInicial' => SENHA_INICIAL]);
        }

        case 'gestor/ativar': {
            exigirEscrita();
            $eu = exigirGestor($db);
            $in = corpo();
            $id = (int) ($in['id'] ?? 0);
            $ativo = !empty($in['ativo']) ? 1 : 0;
            if ($id === (int) $eu['id'] && !$ativo) erro(422, 'proprio', 'Você não pode desativar o próprio acesso.');
            $db->prepare('UPDATE vende_usuarios SET ativo = ? WHERE id = ?')->execute([$ativo, $id]);
            if (!$ativo) encerrarSessoes($db, $id);
            responder(200, ['ok' => true]);
        }

        default:
            erro(404, 'rota', 'Rota não encontrada.');
    }
} catch (PDOException $e) {
    error_log('[vende] ' . $e->getMessage());
    erro(500, 'banco', 'Erro no banco de dados.');
}
