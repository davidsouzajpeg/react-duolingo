# Meu Farol · Treino — integração com o painel do gestor

Quando o vendedor conclui **todas as lições** da trilha (a última lição da
última unidade), o módulo de treino:

1. mostra a tela de **Parabéns** com a mensagem
   _"Em breve o seu gestor irá liberar novos módulos para você."_;
2. mantém um cartão de conclusão no fim da trilha, com o status do aviso
   (**"Gestor avisado em dd/mm"** ou **"Aviso ao gestor pendente"**);
3. envia um aviso para a API do Meu Farol, para o gestor saber que precisa
   criar e liberar novas unidades.

O servidor do Meu Farol (PHP na Hostinger) **não faz parte deste repositório**.
Este documento descreve o contrato que ele precisa atender. O exemplo de
`treino.php` abaixo é um ponto de partida: **não foi testado contra o servidor
real** e precisa ser adaptado ao jeito como o `api/auth.php` guarda a sessão.

## 1. Variável de ambiente

| Variável | Obrigatória | Exemplo |
| --- | --- | --- |
| `NEXT_PUBLIC_FAROL_API_URL` | não | `https://opencriativa.com.br/farol/api` |

- É a **pasta** da API (com ou sem barra no final). O treino chama
  `{NEXT_PUBLIC_FAROL_API_URL}/treino.php`.
- É lida em tempo de **build** (`next build`): depois de alterar, gere o build
  de novo.
- **Sem a variável**, nada é enviado: o aviso fica como "pendente" no navegador
  do vendedor e o treino funciona normalmente. Quando a variável for
  configurada e o vendedor abrir o treino de novo, o aviso pendente é enviado.

## 2. Contrato da requisição

```
POST {NEXT_PUBLIC_FAROL_API_URL}/treino.php
Content-Type: application/json
(cookies de sessão do Meu Farol — fetch com credentials: "include")
```

```json
{
  "op": "trilha_concluida",
  "vendedor": "Carla",
  "trilha": "Venda Consultiva",
  "versao": "consultiva-2025.1",
  "concluidaEm": "2026-11-14T13:05:22.000Z",
  "xpTotal": 912,
  "licoes": 32,
  "precisao": 87,
  "sequencia": 5
}
```

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `op` | string | sempre `"trilha_concluida"` |
| `vendedor` | string | nome que o vendedor informou no treino (**não é autenticação** — use a sessão para saber quem é) |
| `trilha` | string | nome da linha de treino |
| `versao` | string | `TRAIL_VERSION` de `src/farol/content.ts` |
| `concluidaEm` | string ISO 8601 | quando a última lição foi concluída |
| `xpTotal` | número | XP acumulado |
| `licoes` | número | lições concluídas (inclui os desafios) |
| `precisao` | número 0–100 | precisão geral |
| `sequencia` | número | dias de sequência |

**Resposta:** qualquer status **2xx** marca o aviso como enviado
(sugestão: `{"ok": true}`). Qualquer outra resposta, erro de rede ou CORS
mantém o aviso **pendente**; o treino tenta de novo quando uma página do treino
é aberta e quando a conexão volta (evento `online`). O envio pode se repetir:
trate `vendedor + versao` como chave e **não duplique** o registro.

### Se o treino rodar em outro domínio (CORS)

Se o treino for publicado no mesmo domínio do Meu Farol
(`opencriativa.com.br`), os cookies de sessão seguem normalmente. Se ficar em
outro domínio, o `treino.php` precisa:

- responder ao `OPTIONS` (preflight) com `Access-Control-Allow-Origin: <origem
  exata do treino>` (não pode ser `*`), `Access-Control-Allow-Credentials: true`,
  `Access-Control-Allow-Headers: Content-Type` e
  `Access-Control-Allow-Methods: POST, OPTIONS`;
- e o cookie de sessão precisa ser `SameSite=None; Secure`.

## 3. Exemplo mínimo de `treino.php`

Guarda os avisos em um arquivo JSON. Troque por uma tabela se a API já usa
banco de dados.

```php
<?php
// api/treino.php — avisos do Meu Farol · Treino
// ATENÇÃO: adapte as 3 linhas marcadas com "ADAPTE" à sua sessão/auth.php.
session_start();
header('Content-Type: application/json; charset=utf-8');

// --- CORS: só é necessário se o treino estiver em outro domínio ---
$origensPermitidas = ['https://treino.opencriativa.com.br']; // ADAPTE
$origem = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origem, $origensPermitidas, true)) {
  header("Access-Control-Allow-Origin: $origem");
  header('Access-Control-Allow-Credentials: true');
  header('Access-Control-Allow-Headers: Content-Type');
  header('Access-Control-Allow-Methods: POST, OPTIONS');
  header('Vary: Origin');
}
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

function responder(int $status, array $corpo): void {
  http_response_code($status);
  echo json_encode($corpo, JSON_UNESCAPED_UNICODE);
  exit;
}

// --- Sessão: mesmo login do Meu Farol ---
$usuario = $_SESSION['user'] ?? null;            // ADAPTE ao que o auth.php grava
if (!$usuario) responder(401, ['ok' => false, 'erro' => 'nao_autenticado']);
$ehGestor = ($usuario['papel'] ?? '') === 'gestor'; // ADAPTE

$dados = json_decode(file_get_contents('php://input'), true);
if (!is_array($dados)) responder(400, ['ok' => false, 'erro' => 'json_invalido']);

// Guarde o arquivo FORA da pasta pública (ou proteja com .htaccess)
$arquivo = __DIR__ . '/../dados/treino_conclusoes.json';
$ler = function () use ($arquivo): array {
  return is_file($arquivo) ? (json_decode(file_get_contents($arquivo), true) ?: []) : [];
};

switch ($dados['op'] ?? '') {
  case 'trilha_concluida': {
    $precisao = max(0, min(100, (int)($dados['precisao'] ?? 0)));
    $registro = [
      'vendedorId'  => $usuario['id'] ?? null,                 // quem é, pela sessão
      'vendedor'    => $usuario['nome'] ?? mb_substr((string)($dados['vendedor'] ?? ''), 0, 60),
      'trilha'      => mb_substr((string)($dados['trilha'] ?? ''), 0, 80),
      'versao'      => mb_substr((string)($dados['versao'] ?? ''), 0, 40),
      'concluidaEm' => mb_substr((string)($dados['concluidaEm'] ?? ''), 0, 30),
      'xpTotal'     => max(0, (int)($dados['xpTotal'] ?? 0)),
      'licoes'      => max(0, (int)($dados['licoes'] ?? 0)),
      'precisao'    => $precisao,
      'sequencia'   => max(0, (int)($dados['sequencia'] ?? 0)),
      'recebidoEm'  => date('c'),
      'visto'       => false,
    ];
    if ($registro['versao'] === '') responder(400, ['ok' => false, 'erro' => 'versao_obrigatoria']);

    $fp = fopen($arquivo, 'c+');
    if (!$fp) responder(500, ['ok' => false, 'erro' => 'armazenamento']);
    flock($fp, LOCK_EX);
    $lista = json_decode(stream_get_contents($fp) ?: '[]', true) ?: [];
    // idempotente: um registro por vendedor + versão da trilha
    $lista = array_values(array_filter($lista, fn($r) =>
      !(($r['vendedorId'] ?? null) === $registro['vendedorId'] && ($r['versao'] ?? '') === $registro['versao'])
    ));
    $lista[] = $registro;
    ftruncate($fp, 0); rewind($fp);
    fwrite($fp, json_encode($lista, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    flock($fp, LOCK_UN); fclose($fp);
    responder(200, ['ok' => true]);
  }

  case 'listar': { // painel do gestor
    if (!$ehGestor) responder(403, ['ok' => false, 'erro' => 'apenas_gestor']);
    responder(200, ['ok' => true, 'conclusoes' => $ler()]);
  }

  default:
    responder(400, ['ok' => false, 'erro' => 'op_desconhecida']);
}
```

Chamada do painel do gestor (mesmo padrão das outras rotas da API):

```js
const r = await fetch("api/treino.php", {
  method: "POST",
  credentials: "same-origin",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ op: "listar" }),
});
const { conclusoes } = await r.json();
```

## 4. Cartão sugerido no painel do gestor

Para cada item de `conclusoes` ainda não tratado:

> **{vendedor} concluiu a trilha Venda Consultiva em {dd/mm} — crie e libere
> novas unidades.**
> {licoes} lições · {precisao}% de precisão · {xpTotal} XP · {sequencia} dias de sequência

Exemplo: _"Carla concluiu a trilha Venda Consultiva em 14/11 — crie e libere
novas unidades."_

## 5. Como liberar novas unidades

1. Em `src/farol/content.ts`, adicione a nova unidade ao array `seeds`
   (`id: "u9"`, `number: 9`, três lições `u9-l1`, `u9-l2`, `u9-l3`, com 4–5
   questões cada). O desafio da unidade é montado automaticamente.
2. **Suba o `TRAIL_VERSION`** no mesmo arquivo (ex.: `"consultiva-2025.1"` →
   `"consultiva-2025.2"`).
3. Opcional: adicione a conquista da unidade em `src/farol/gamification.ts`
   (`unitBadge(9, "🏷️", "Nome da conquista")`).
4. Gere o build e publique.

O que acontece para quem já tinha concluído: como passam a existir lições não
concluídas, o cartão de "Trilha concluída" some sozinho e a trilha continua na
nova unidade. Quando o vendedor concluir a nova última unidade, um **novo
aviso** é enviado com a nova `versao`.

## 6. Limites desta versão

- O progresso do treino fica no **navegador do vendedor** (localStorage). Se
  ele trocar de aparelho ou limpar os dados, o progresso e o aviso pendente
  não acompanham.
- O campo `vendedor` é o nome digitado no treino. Para saber com certeza quem
  concluiu, use a **sessão** do Meu Farol no servidor (como no exemplo).
- A liberação de novos módulos é feita publicando uma nova versão do conteúdo;
  ainda não há liberação por vendedor a partir do painel.
