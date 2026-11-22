# Igreja Batista Medaberel - Setor Cabula VI

Site estatico com homepage responsiva, agenda publica e painel administrativo integrado ao Firebase.

## Executar localmente

Na raiz do projeto:

```powershell
python -m http.server 8000
```

Paginas principais:

- `http://localhost:8000/` - homepage
- `http://localhost:8000/eventos.html` - agenda publica
- `http://localhost:8000/admin.html` - painel administrativo

## Estrutura

```text
/
|-- index.html                 Homepage canonica
|-- eventos.html               Agenda publica
|-- admin.html                 Painel administrativo
|-- css/
|   |-- home.css               Estilos da homepage
|   `-- admin-events.css       Estilos da agenda e do painel
|-- js/
|   |-- home.js                Dados e interacoes da homepage
|   |-- firebase-config.js     Inicializacao do Firebase
|   |-- events-public.js       Eventos da agenda publica
|   `-- admin.js               Autenticacao e CRUD administrativo
|-- assets/
|   |-- images/                Imagens ativas organizadas por finalidade
|   `-- legacy/                Documentos e midias antigas preservadas
|-- docs/                      Documentacao de configuracao
|-- firebase/firestore.rules   Modelo de regras do Firestore
|-- nova-versao/index.html     Redirecionamento da URL antiga
`-- CNAME                     Dominio personalizado
```

## Arquivos publicos preservados

Imagens, videos e documentos sem referencia interna atual ficam em `assets/legacy/`. Consulte `docs/inventario-arquivos.md` antes de remove-los.

## Firebase

As paginas leem dados do Firestore diretamente no navegador. O painel usa Firebase Authentication para as operacoes administrativas.

O arquivo `firebase/firestore.rules` e apenas um modelo e ainda exige a configuracao do UID administrativo antes de um deploy manual das regras.
