# Configuracao Rapida (Firebase)

## 1) Criar projeto no Firebase
1. Acesse o Firebase Console e crie um projeto.
2. Em `Build > Authentication`, habilite `Email/Password`.
3. Em `Build > Firestore Database`, crie o banco em modo producao.
4. Em `Configuracoes do projeto > Geral`, adicione um app Web.
5. Copie as credenciais do Firebase.

## 2) Colocar credenciais no site
1. Abra `js/firebase-config.js`.
2. Substitua todos os campos `SUA_...` e `SEU_...` pelas credenciais reais.

## 3) Criar usuario admin (a "chave")
1. Em `Authentication > Users`, clique em `Add user`.
2. Crie o email do admin e uma senha forte.
3. Essa senha e sua chave de edicao.

## 4) Restringir edicao para um unico usuario
1. No Firebase Console, abra `Firestore Database > Rules`.
2. Copie o conteudo de `firebase-rules.txt`.
3. Troque `COLE_AQUI_UID_DO_ADMIN` pelo UID do usuario admin.
4. Publique as regras.

## 5) Usar no site
1. Pagina publica: `index.html` (todos veem a lista).
2. Pagina de edicao: `admin.html` (somente admin autenticado consegue gravar).

## Estrutura dos dados (colecao `aniversariantes`)
Cada registro salvo contem:
- `nome` (string)
- `dia` (number)
- `mes` (number)
- `observacao` (string, opcional)
