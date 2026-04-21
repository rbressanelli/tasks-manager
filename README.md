# 📋 Gerenciador de Tarefas

Aplicativo desenvolvido em React para gerenciamento de tarefas, com sistema drag-and-drop, onde os cards podem ser movidos deslocando os mesmos de acordo com a situação da tarefa.

## 🚀 Tecnologias

- **React 19**
- **Vite** (Build Tool)
- **TypeScript** (Tipagem estática)
- **Tailwind CSS** (Estilização)
- **dnd-kit** (Sistema de Drag and Drop)
- **Firebase** (Autenticação e Banco de Dados)
- **React Hook Form & Zod** (Validação de formulários)
- **React Router Dom** (Navegação)

## 📁 Estrutura do Projeto

```text
src/
├── assets/      # Imagens e arquivos estáticos
├── components/  # Componentes reutilizáveis (Card, Modal, Button, etc.)
├── context/     # Contextos (Autenticação e Estado Global)
├── pages/       # Páginas principais da aplicação
├── routes/      # Configurações de rotas
├── types/       # Definições de tipos TypeScript
└── firebase.ts  # Configuração inicial do Firebase
```

## 🛠️ Como rodar o projeto

1. **Clone o repositório:**
   ```bash
   git clone <url-do-repositorio>
   cd drag-drop
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**
   - Crie um arquivo `.env` na raiz do projeto baseado no `.env.example`.
   - Preencha com as suas credenciais do Firebase.

4. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

## 🔐 Variáveis de ambiente necessárias

O projeto utiliza o Firebase para autenticação e persistência. As seguintes variáveis devem ser configuradas:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`

## 💡 Sugestão de melhorias

- 📅 Integrar com calendário Google
- ⏰ Incluir horário no card
- 🔑 Recuperar senha
