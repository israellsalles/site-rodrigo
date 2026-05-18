# Guia de Configuracao do Firebase

## O que voce vai precisar
- Uma conta Google
- O projeto do site aberto no computador

---

## Passo 1 — Criar o projeto no Firebase

1. Acesse [console.firebase.google.com](https://console.firebase.google.com)
2. Clique em **Adicionar projeto**
3. Digite um nome (ex: `siterodrigo`) e clique em **Continuar**
4. Desative o Google Analytics (nao e necessario) e clique em **Criar projeto**
5. Aguarde e clique em **Continuar**

---

## Passo 2 — Registrar o app Web

1. Na tela inicial do projeto, clique no icone **</>** (Web)
2. Digite um apelido para o app (ex: `site`) e clique em **Registrar app**
3. Vai aparecer um bloco de codigo assim:

```js
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "siterodrigo.firebaseapp.com",
  projectId: "siterodrigo",
  storageBucket: "siterodrigo.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123...:web:abc..."
};
```

4. **Copie esses valores** — voce vai precisar deles no Passo 3
5. Clique em **Continuar no console**

---

## Passo 3 — Colocar as credenciais no site

1. Abra o arquivo `js/firebase-config.js` no editor
2. Substitua cada campo com os valores copiados no passo anterior:

```js
const firebaseConfig = {
  apiKey: "cole aqui o apiKey",
  authDomain: "cole aqui o authDomain",
  projectId: "cole aqui o projectId",
  storageBucket: "cole aqui o storageBucket",
  messagingSenderId: "cole aqui o messagingSenderId",
  appId: "cole aqui o appId",
  measurementId: "cole aqui o measurementId", // se houver
};
```

3. Salve o arquivo

---

## Passo 4 — Criar o banco de dados (Firestore)

1. No menu lateral do Firebase Console, clique em **Build > Firestore Database**
2. Clique em **Criar banco de dados**
3. Selecione **Iniciar no modo de producao** e clique em **Proximo**
4. Escolha a regiao mais proxima (ex: `us-east1`) e clique em **Ativar**
5. Aguarde o banco ser criado

---

## Passo 5 — Ativar o login por email/senha

1. No menu lateral, clique em **Build > Authentication**
2. Clique em **Comecar**
3. Na aba **Metodo de login**, clique em **E-mail/senha**
4. Ative a primeira opcao (**E-mail/senha**) e clique em **Salvar**

---

## Passo 6 — Criar o usuario administrador

1. Ainda em **Authentication**, clique na aba **Usuarios**
2. Clique em **Adicionar usuario**
3. Preencha:
   - **E-mail:** qualquer email (ex: `admin@suaigreja.com`)
   - **Senha:** uma senha forte — essa sera a chave de acesso ao painel
4. Clique em **Adicionar usuario**
5. O usuario vai aparecer na lista — **copie o UID** (a coluna "Identificador do usuario", string longa como `abc123xyz...`)

> Guarde bem esse email e senha. Sao as unicas credenciais que dao acesso ao painel de edicao.

---

## Passo 7 — Aplicar as regras de seguranca

1. No menu lateral, clique em **Build > Firestore Database**
2. Clique na aba **Regras**
3. Apague o conteudo atual e cole o seguinte:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /aniversariantes/{docId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null
        && request.auth.uid == "COLE_AQUI_O_UID_DO_ADMIN";
    }

    match /eventos/{docId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null
        && request.auth.uid == "COLE_AQUI_O_UID_DO_ADMIN";
    }
  }
}
```

4. Substitua `COLE_AQUI_O_UID_DO_ADMIN` pelo UID copiado no Passo 6
5. Clique em **Publicar**

> Essa regra permite que qualquer pessoa veja a lista, mas so o admin pode editar. A agenda de eventos usa links publicos de imagem, entao nao precisa ativar o Storage.

---

## Passo 8 — Testar

1. Abra o arquivo `index.html` no navegador — a lista de aniversariantes deve aparecer (vazia por enquanto)
2. Abra o arquivo `admin.html` no navegador
3. Faca login com o email e senha criados no Passo 6
4. Adicione um aniversariante e verifique se aparece no `index.html`
5. Abra `admin-eventos.html`, cole o link publico de uma imagem de evento e verifique se aparece em `eventos.html`

---

## Estrutura da colecao no Firestore

Cada documento salvo na colecao `aniversariantes` contem:

| Campo       | Tipo   | Descricao                        |
|-------------|--------|----------------------------------|
| `nome`      | string | Nome completo                    |
| `dia`       | number | Dia do aniversario (1 a 31)      |
| `mes`       | number | Mes do aniversario (1 a 12)      |
| `observacao`| string | Informacao extra (ex: ministerio)|

---

## Problemas comuns

**"Nao foi possivel entrar" no login**
- Verifique se o Authentication esta ativo (Passo 5)
- Confirme o email e senha digitados

**Lista nao carrega no site**
- Verifique se as credenciais em `js/firebase-config.js` estao corretas
- Verifique se o Firestore foi criado (Passo 4)

**"Nao foi possivel salvar" ao adicionar aniversariante**
- Verifique se o UID nas regras do Firestore esta correto (Passo 7)
- Confirme que as regras foram publicadas
