# NoteKeeper

[![.NET](https://img.shields.io/badge/.NET-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![OpenAPI / Swagger](https://img.shields.io/badge/OpenAPI%20%2F%20Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)](https://swagger.io/)
[![Entity Framework Core](https://img.shields.io/badge/Entity%20Framework%20Core-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)](https://learn.microsoft.com/ef/core/)
[![ASP.NET Core Identity](https://img.shields.io/badge/ASP.NET%20Core%20Identity-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)](https://learn.microsoft.com/aspnet/core/security/authentication/identity)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Lucide Icons](https://img.shields.io/badge/Lucide%20Icons-F56565?style=for-the-badge&logo=lucide&logoColor=white)](https://lucide.dev/)

## Introdução

O NoteKeeper é uma aplicação para registrar e organizar anotações em um só lugar. A proposta é ajudar o usuário a guardar ideias e informações importantes de forma simples e fácil de encontrar. Para isso, as informações são organizadas em categorias e notas.

## Módulo de Autenticação

### Requisitos funcionais

- Permitir que um usuário crie uma conta informando nome, e-mail e senha;
- Permitir que o usuário entre na aplicação com e-mail e senha;
- Manter a sessão autenticada e permitir que o usuário encerre sua sessão;
- Exibir o nome do usuário autenticado na interface;
- Restringir o acesso às funcionalidades pessoais da aplicação a usuários autenticados.

### Regras de negócio

- **Nome:** obrigatório e utilizado para identificar o usuário na interface;
- **E-mail:** obrigatório, válido e único;
- **Senha:** obrigatória, com pelo menos 8 caracteres, incluindo um número e um caractere especial;
- Após o login, as operações protegidas devem utilizar o token de autenticação da sessão;
- Cada usuário pode acessar somente as próprias notas e categorias.

## Módulo de Categorias

### Requisitos funcionais

- Registrar novas categorias;
- Visualizar todas as categorias cadastradas;
- Editar categorias existentes;
- Excluir categorias cadastradas.

### Regras de negócio

- **Título:** obrigatório, entre 2 e 100 caracteres;
- Não é permitido cadastrar duas categorias com o mesmo título.

## Módulo de Notas

### Requisitos funcionais

- Registrar novas notas;
- Visualizar todas as notas cadastradas;
- Agrupar notas por uma ou mais categorias;
- Editar notas existentes;
- Excluir notas cadastradas.

### Regras de negócio

- **Título:** obrigatório, entre 2 e 100 caracteres;
- **Descrição:** opcional, com até 300 caracteres;
- **Status:** ativa ou arquivada;
- **Categorias:** opcionais; uma nota pode não estar associada a nenhuma categoria;
- Não é permitido cadastrar duas notas com o mesmo título.
