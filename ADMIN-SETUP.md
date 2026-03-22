# Conta de administrador (criada no Firebase)

O **Admin Alert** só aceita login de usuários com `role: "admin"` no Firestore.

## Rotas e segurança

- **`/login`** — tela de entrada (pública). Se já houver sessão Firebase com `role: "admin"`, o app redireciona para `/admin`.
- **`/admin`** — painel (rota **privada**): só acessível com **Firebase Authentication** ativo e documento `users/{uid}` com `role: "admin"`. Não usa token em `localStorage` como o painel web policial; a sessão é a do Firebase Auth.
- **`/`** — redireciona para `/admin` (que exige login).

## Onde fica a senha?

A **senha não é guardada no Firestore** (e não deve ser colocada em nenhum documento).

- **E-mail e senha** são definidos no **Firebase Authentication** (Console → **Authentication** → **Users** → adicionar usuário com e-mail/senha).
- O **Firestore** (`users/{uid}`) guarda só dados de perfil, como `name`, `email` e **`role: "admin"`**.

Ou seja: você **cria o login (e-mail + senha) no Authentication** e **cria o documento no Firestore** com o mesmo UID, com `role: "admin"`. Na tela do Admin Alert você usa **esse mesmo e-mail e essa mesma senha** do Authentication.

## Passos

1. No **Firebase Console** → **Authentication** → **Users** → **Add user**: informe **e-mail** e **senha** (essa é a senha da tela de login). Anote o **UID** do usuário criado.
2. No **Firestore** → coleção `users` → documento com ID = **UID** do passo 1 (não coloque senha aqui).

### Campos recomendados no documento `users/{uid}`

| Campo    | Tipo   | Obrigatório | Descrição |
|----------|--------|-------------|-----------|
| `uid`    | string | Sim         | Mesmo ID do documento / usuário Auth |
| `email`  | string | Sim         | E-mail do login |
| `name`   | string | Recomendado | Nome para exibição |
| `role`   | string | **Sim**     | Deve ser exatamente `"admin"` para acessar o Admin Alert |

Exemplo mínimo:

```json
{
  "uid": "<UID_DO_AUTH>",
  "name": "Nome do Administrador",
  "email": "admin@exemplo.com",
  "role": "admin"
}
```

3. Acesse o Admin Alert e faça login com esse e-mail e senha. **Não há tela de cadastro** — só login.

**Policial:** cadastrado pelo admin neste app (`role: "police"`).  
**Vítima:** cadastro pelo app mobile (`role: "victim"`).  
**Web (painel policial):** só aceita `role: "police"`.

## Cadastro de policial pelo admin

Após cadastrar um policial, **a sessão do administrador continua ativa** (não é necessário entrar de novo). O admin só sai ao clicar em **Sair** (com confirmação) ou ao **atualizar a página (F5)**.

Tecnicamente, o app cria o usuário policial numa **segunda instância** do Firebase Auth (mesmo projeto), para não trocar o usuário logado na instância principal.

**Firestore:** as regras de segurança precisam permitir que um usuário com `role: "admin"` crie/atualize documentos em `users/{uid}` para novos policiais.
