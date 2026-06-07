# Sistema de ERP e Estoque Automotivo

Este é um projeto de front-end desenvolvido para uma disciplina da faculdade. O objetivo do sistema é simular um ERP voltado para o gerenciamento e consulta de estoque, contando com uma tela de login integrada e persistência de dados local.

---

## 🚀 Funcionalidades do Sistema

### 1. Autenticação (Login e Primeiro Acesso)
* **Modo Híbrido:** A mesma interface é reaproveitada dinamicamente para o login de usuários ou para o cadastro de um primeiro acesso (tudo manipulado via JavaScript na mesma tela).
* **Validação de Credenciais:** Os dados do usuário são salvos e validados diretamente no navegador para liberar o acesso ao painel principal (`dashboard.html`).

### 2. Cadastro de Produtos (Estoque)
* **Trava de Segurança (Anti-duplicação):** O sistema impede o cadastro de produtos duplicados por distração. Se houver uma tentativa de cadastrar um item com a **mesma descrição e mesma marca**, o sistema barra o envio e alerta o usuário.
* **Geração de ID Sequencial:** Diferente de códigos aleatórios gigantes, o sistema gera automaticamente um código interno padronizado e em sequência (ex: `INT000001`, `INT000002`), baseado na quantidade real de itens salvos.

### 3. Consulta de Estoque
* **Renderização Dinâmica:** Os dados salvos são lidos na hora e injetados na tabela de consulta.
* **Contador de Resultados:** Exibe no topo da tabela a quantidade exata de registros encontrados em tempo real.
* **Estado Vazio (Empty State):** Caso nenhum produto esteja cadastrado, a tabela exibe uma mensagem amigável avisando que o estoque está zerado.

---

## 🛠️ Tecnologias Utilizadas

Para garantir um código limpo e entender os conceitos fundamentais da web, o projeto foi construído sem frameworks externos:

* **HTML5:** Estruturação semântica das telas e formulários.
* **CSS3:** Estilização visual (layouts responsivos com Flexbox).
* **JavaScript (ES6):** Manipulação de eventos do DOM, lógica de validação e persistência.
* **Web Storage API (LocalStorage):** Utilizado como banco de dados local para guardar os dados de login e o array de produtos de forma persistente.

---

## 📂 Estrutura de Arquivos

A lógica de JavaScript foi separada de forma estratégica para evitar conflitos de escopo entre as telas:

```text
├── index.html          # Tela inicial com o pop-up de Login / Primeiro Acesso
├── dashboard.html      # Painel principal do sistema
├── cadastro.html       # Tela de formulário de cadastro de produtos
├── consulta.html       # Tela de listagem da tabela de estoque
├── css/
│   └── (arquivos de estilização)
└── scripts/
    ├── login.js        # Cuida estritamente da validação e alternância do Login
    └── deashbord.js     # Controla o LocalStorage, regras de cadastro e a tabela
