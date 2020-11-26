<h2>API de autenticação usando Express js</h2>

<strong>Iniciar aplicação:</strong>
```
npm run serve
```
<strong>Testes unitários na aplicação:</strong>
```
npm run test
```
| Rotas | Descrição | Corpo |
| ----- | --------- | ----- |
| localhost:8088/register | Realiza o cadastro do usuário no sistema | {name: '', email: '', password: ''} |
| localhost:8088/login | Realiza o login do usuário | {email: '', password: ''} |
| localhost:8088/register | Realiza o logout do usuário | {token: ''} |

| Códigos de resposta | Descrição |
| ------------------- | --------- |
| 11 | REGISTER.SUCCESS |
| 12 | REGISTER.ALREADY_REGISTERED |
| 21 | LOGIN.SUCCESS |
| 23 | LOGIN.INVALID_CREDENTIALS |
| 24 | LOGIN.USER_NOT_EXISTS |
| 31 | LOGOUT.SUCCESS |
| 32 | LOGOUT.INVALID_OR_DISABLE_TOKEN |
| 41 | INVALID_FIELD.NAME |
| 42 | INVALID_FIELD.EMAIL |
| 43 | INVALID_FIELD.PASSWORD |
| 44 | INVALID_FIELD.TOKEN |
| 45 | INVALID_FIELD.BODY |
| 51 | QUERY_ERROR |
