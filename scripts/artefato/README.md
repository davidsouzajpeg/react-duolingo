# Artefato de teste do Vendê

Empacota o app inteiro (`/farol`) em uma página única, `vende.html`, para publicar como artefato e testar sem servidor.

```bash
cd scripts/artefato
npm install esbuild@0.21.5 --no-save
node build.mjs   # gera vende.html nesta pasta
```

- `shims/` troca o roteador, os links e o `<Head>` do Next por versões em memória.
- `entry.tsx` monta as telas e o painel de teste (moedas, virada de semana, dia perdido, liberar lições).
- React vem do cdnjs; o restante vai embutido na página.
