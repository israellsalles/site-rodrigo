# Inventario de arquivos

Este inventario registra a estrutura organizada em novembro de 2026.

## Runtime ativo

### Paginas

- `index.html` - homepage canonica
- `eventos.html` - agenda publica
- `admin.html` - painel administrativo
- `nova-versao/index.html` - redirecionamento da URL antiga

### CSS e JavaScript

- `css/home.css`
- `css/admin-events.css`
- `js/home.js`
- `js/firebase-config.js`
- `js/events-public.js`
- `js/admin.js`

### Imagens

- `assets/images/branding/logo-medaberel.svg`
- `assets/images/fallback/agenda-eventos.jpg`
- `assets/images/hero/biblia-por-do-sol.jpg`
- `assets/images/cultos/culto-familia.jpg`
- `assets/images/cultos/culto-provisao.jpg`
- `assets/images/cultos/culto-libertacao.jpg`

## Arquivos legados

Os arquivos abaixo nao possuem referencia interna atual. Foram agrupados em `assets/legacy/` para facilitar manutencao e futuras decisoes de remocao.

### Documento

- `assets/legacy/documents/escola-biblica-dominical.pdf`

### Imagens e QR code

- `assets/legacy/images/biblia-por-do-sol.webp`
- `assets/legacy/images/culto-familia-antigo.jpg`
- `assets/legacy/images/culto-provisao-antigo.jpg`
- `assets/legacy/images/culto-libertacao-antigo.jpg`
- `assets/legacy/images/escola-biblica-antigo.jpg`
- `assets/legacy/images/pedido-oracao-antigo.jpg`
- `assets/legacy/images/plano-leitura-antigo.jpg`
- `assets/legacy/images/circulo-oracao-antigo.jpg`
- `assets/legacy/qrcode/qrcode-site.png`

### Videos

- `assets/legacy/videos/culto-familia.mp4`
- `assets/legacy/videos/culto-provisao.mp4`
- `assets/legacy/videos/culto-libertacao.mp4`

## Removidos anteriormente

- `js/birthdays-public.js` - funcionalidade incorporada a `js/home.js`
- `js/site-links.js` - funcionalidade incorporada a `js/home.js`
- `js/tap-feedback.js` - nenhum elemento ativo utilizava o script
- `js/video-modal.js` - modal e videos nao fazem mais parte da homepage
- `assets/6E88DE02-14BD-4D74-A6C9-530A553C1DD0.pdf` - documento financeiro inadequado para publicacao

## Convencoes

- Nomes de arquivos usam minusculas, ASCII e kebab-case.
- Imagens ativas ficam em `assets/images/`, agrupadas por finalidade.
- Midias sem uso no runtime ficam em `assets/legacy/`.
- Codigo de apresentacao fica em `css/`; comportamento fica em `js/`.
- `CNAME`, `README.md` e arquivos HTML raiz mantem os nomes exigidos por convencao ou por suas URLs publicas.
