# Auth Context

O arquivo `Frontend/components/auth-context.tsx` centraliza a autenticacao do aplicativo. Ele guarda quem e o usuario logado, restaura a sessao salva no celular, faz login e cadastro usando a API Laravel, salva o token no `AsyncStorage` e oferece funcoes para as telas acessarem tudo isso de forma simples.

Na pratica, qualquer tela que chama `useAuth()` consegue saber se existe usuario autenticado, acessar os dados do usuario atual e executar acoes como entrar, cadastrar, atualizar perfil ou sair da conta.

## Principais responsabilidades

- Manter o estado global do usuario logado.
- Restaurar a sessao salva quando o app abre.
- Fazer login pela rota `/api/auth/login`.
- Fazer cadastro pela rota `/api/auth/register`.
- Salvar `token + user` no `AsyncStorage`.
- Limpar sessao no logout.
- Redirecionar para `/login` quando o token expira ou a API retorna `401`.
- Fornecer o hook `useAuth()` para o restante do app.

## Tipos principais

### `AuthUser`

Representa o usuario no formato usado pelo frontend.

Ele contem:

- `id`: identificador vindo da API.
- `email`: e-mail do usuario.
- `nickname`: apelido exibido no app.
- `profilePhotoUri`: foto de perfil, quando existir.

Esse tipo e diferente do retorno bruto da API porque o app prefere nomes como `nickname` e `profilePhotoUri`, enquanto o backend usa campos como `name`, `username` e `avatar_url`.

### `AuthSession`

Representa a sessao salva localmente.

Ela contem:

- `token`: token Sanctum usado nas proximas chamadas.
- `user`: dados do usuario logado.

Essa sessao e salva no `AsyncStorage` usando a chave `AUTH_STORAGE_KEY`, importada de `@/lib/api`.

### `ApiUser`

Representa o usuario no formato recebido da API Laravel.

Ele aceita campos opcionais como:

- `id`
- `name`
- `username`
- `email`
- `avatar_url`

Depois, esse objeto e convertido para `AuthUser` pela funcao `normalizeApiUser`.

### `AuthContextValue`

Define tudo que o contexto de autenticacao disponibiliza para as telas:

- `isAuthenticated`: indica se existe usuario logado.
- `isLoading`: indica se a sessao ainda esta sendo carregada.
- `user`: usuario atual ou `null`.
- `signIn`: faz login.
- `signUp`: faz cadastro.
- `updateNickname`: atualiza apelido localmente.
- `updateProfilePhoto`: atualiza foto localmente.
- `signOut`: faz logout.

## Funcoes auxiliares

### `normalizeNickname`

Recebe um apelido e retorna uma versao padronizada, sem espacos nas pontas e em letras minusculas.

Ela e usada para comparar apelidos sem diferenciar maiusculas, minusculas ou espacos extras.

### `getRegisteredUsers`

Le uma lista local de usuarios salva no `AsyncStorage`.

Esse trecho ainda existe porque o app tambem tem funcoes locais de atualizacao de apelido e foto. Ele nao e mais o login principal, ja que login e cadastro agora usam a API Laravel.

### `normalizeApiUser`

Converte o usuario recebido da API para o formato usado pelo app.

Exemplo conceitual:

```ts
{
  name: 'Gabriel',
  email: 'gabriel@email.com',
  avatar_url: 'https://...'
}
```

vira:

```ts
{
  nickname: 'Gabriel',
  email: 'gabriel@email.com',
  profilePhotoUri: 'https://...'
}
```

Ela tambem define fallback para o apelido. Se a API nao mandar `name` nem `username`, o app tenta usar a parte antes do `@` no e-mail. Se nem isso existir, usa `Jardineiro`.

### `parseApiError`

Extrai uma mensagem amigavel quando a API retorna erro.

Ela tenta buscar primeiro erros de validacao, por exemplo:

```json
{
  "errors": {
    "email": ["Este e-mail ja esta em uso."]
  }
}
```

Se nao houver erro de validacao, tenta usar `message`. Se tambem nao existir, usa uma mensagem padrao passada como fallback.

### `saveCurrentSession`

Salva a sessao atual no `AsyncStorage`.

A sessao inclui:

- token de autenticacao;
- dados do usuario.

Isso permite que o app continue logado mesmo depois de ser fechado e aberto novamente.

### `saveRegisteredUsers`

Salva uma lista local de usuarios no `AsyncStorage`.

Hoje ela e usada pelas funcoes locais de atualizacao de perfil. O ideal, futuramente, seria tambem mover atualizacao de apelido e foto para rotas da API, assim o perfil ficaria persistido no backend.

## `AuthProvider`

O `AuthProvider` e o componente principal deste arquivo.

Ele deve envolver as telas do app para que qualquer componente abaixo dele consiga acessar autenticacao com `useAuth()`.

Internamente, ele controla dois estados:

- `user`: usuario logado.
- `isLoading`: indica se o app ainda esta tentando restaurar a sessao salva.

## Restauracao da sessao

Quando o app abre, o `AuthProvider` busca no `AsyncStorage` uma sessao salva.

Se encontrar uma sessao com token e usuario, ele restaura o usuario no estado:

```ts
setUser(...)
```

Isso faz o app considerar o usuario autenticado sem precisar fazer login novamente.

Quando termina a tentativa de restauracao, ele define:

```ts
setIsLoading(false)
```

Assim as telas sabem que ja podem decidir se exibem conteudo protegido ou redirecionam para login.

## Expiracao do token

O provider registra uma funcao usando:

```ts
setAuthExpiredHandler(...)
```

Essa funcao e chamada pelo `apiFetch` quando qualquer requisicao recebe `401 Unauthorized`.

Quando isso acontece, o app:

1. limpa o usuario do estado;
2. remove a sessao salva;
3. redireciona para `/login`.

Esse comportamento evita repetir a mesma logica em todas as telas protegidas.

## Login

A funcao `signIn` recebe apelido e senha.

Ela chama:

```ts
apiFetch('/api/auth/login', ...)
```

Enviando:

```json
{
  "nickname": "apelido",
  "password": "senha"
}
```

Se a API responder erro, a funcao transforma a resposta em uma mensagem amigavel com `parseApiError`.

Se der certo, a API retorna:

- `token`;
- `user`.

O usuario e normalizado com `normalizeApiUser`, a sessao e salva no `AsyncStorage`, e o estado `user` e atualizado.

## Cadastro

A funcao `signUp` recebe e-mail, senha e apelido.

Ela chama:

```ts
apiFetch('/api/auth/register', ...)
```

Enviando:

```json
{
  "email": "email@exemplo.com",
  "nickname": "apelido",
  "password": "senha"
}
```

O fluxo de sucesso e parecido com o login:

1. recebe token e usuario da API;
2. normaliza o usuario;
3. salva a sessao localmente;
4. atualiza o estado do contexto.

Com isso, depois de cadastrar, o usuario ja fica logado.

## Atualizacao de apelido

A funcao `updateNickname` atualiza o apelido do usuario no estado e no storage local.

Ela:

1. verifica se existe usuario logado;
2. limpa espacos do apelido;
3. compara com usuarios locais para evitar duplicidade;
4. cria um novo objeto de usuario;
5. salva a lista local atualizada;
6. atualiza a sessao mantendo o mesmo token;
7. atualiza o estado `user`.

Atencao: essa alteracao ainda e local. Ela nao envia o novo apelido para o Laravel.

## Atualizacao de foto de perfil

A funcao `updateProfilePhoto` atualiza a foto do usuario no estado e no storage local.

Ela segue uma ideia parecida com `updateNickname`:

1. verifica se existe usuario logado;
2. cria um novo usuario com `profilePhotoUri`;
3. salva a lista local;
4. atualiza a sessao mantendo o token;
5. atualiza o estado.

Atencao: essa foto tambem ainda nao e enviada para o backend.

## Logout

A funcao `signOut` encerra a sessao.

Ela tenta chamar:

```ts
apiFetch('/api/auth/logout', { method: 'POST' })
```

Essa rota remove/invalida o token atual no Laravel.

Mesmo que essa chamada falhe, o app continua o logout local:

- remove a sessao do `AsyncStorage`;
- limpa o usuario do estado.

Isso garante que o usuario saia do app mesmo se estiver sem conexao ou se a API estiver indisponivel no momento.

## `useMemo`

O objeto entregue pelo contexto e criado dentro de um `useMemo`.

Isso evita recriar o objeto inteiro em todo render sem necessidade.

Ele so e recalculado quando:

- `isLoading` muda;
- `user` muda.

## `useAuth`

O `useAuth` e um hook customizado para facilitar o uso do contexto.

Em vez de toda tela precisar fazer:

```ts
useContext(AuthContext)
```

ela pode simplesmente fazer:

```ts
const { user, signIn, signOut } = useAuth();
```

Se alguem tentar usar `useAuth()` fora do `AuthProvider`, o hook lanca um erro. Isso ajuda a identificar rapidamente quando uma tela nao esta dentro da estrutura correta.

## Fluxo completo

1. O app inicia.
2. O `AuthProvider` tenta restaurar a sessao salva.
3. Se houver token e usuario, o app considera o usuario logado.
4. Se nao houver sessao, o usuario vai para login.
5. No login ou cadastro, a API Laravel retorna token e usuario.
6. O app salva essa sessao no `AsyncStorage`.
7. As proximas chamadas usam `apiFetch`, que adiciona o token automaticamente.
8. Se a API retornar `401`, o app limpa a sessao e volta para `/login`.
9. No logout, o token e invalidado na API e removido localmente.

## Relacao com `api.ts`

O `auth-context.tsx` depende de `Frontend/lib/api.ts` para fazer chamadas autenticadas.

O `apiFetch` e responsavel por:

- montar a URL da API;
- adicionar `Content-Type` quando necessario;
- buscar o token salvo;
- enviar `Authorization: Bearer token`;
- detectar `401`;
- acionar o handler de expiracao de autenticacao.

Assim, o `auth-context.tsx` cuida da sessao e o `api.ts` cuida da mecanica das requisicoes.
