<?php
/**
 * Copie para config.php NO SERVIDOR e preencha. O config.php de verdade não
 * entra no repositório.
 */
return [
    // MySQL da hospedagem (o app e o banco ficam no mesmo servidor)
    'dsn' => 'mysql:host=127.0.0.1;port=3306;dbname=NOME_DO_BANCO;charset=utf8mb4',
    'user' => 'USUARIO_DO_BANCO',
    'password' => 'SENHA_DO_BANCO',
    // usada uma única vez na rota "instalar" (cria tabelas e o primeiro gestor)
    'chave_instalacao' => 'TROQUE_POR_UM_TEXTO_LONGO_E_ALEATORIO',
];
