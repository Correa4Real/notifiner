# Notification Manager

Um aplicativo mobile desenvolvido com React Native e Expo para gerenciar notificações de aplicativos instalados no dispositivo. Permite controlar volume, sons, vibração e prioridade das notificações de cada app de forma individualizada.

## 📱 Sobre o Projeto

O Notification Manager oferece uma interface intuitiva e moderna para gerenciar todas as notificações do seu dispositivo em um único lugar. Com este app, você pode:

- Visualizar todos os aplicativos instalados
- Ativar/desativar notificações por app
- Configurar volume individual para cada app
- Escolher sons de notificação personalizados
- Controlar vibração por aplicativo
- Definir prioridade de notificações (baixa, normal, alta)

## 🚀 Tecnologias Utilizadas

- **React Native** - Framework para desenvolvimento mobile
- **Expo** - Plataforma e ferramentas para desenvolvimento React Native
- **Expo Router** - Roteamento baseado em arquivos
- **TypeScript** - Tipagem estática para JavaScript
- **Expo Notifications** - Gerenciamento de notificações
- **Expo Secure Store** - Armazenamento seguro de dados
- **Expo AV** - Reprodução de áudio

## 📋 Pré-requisitos

Antes de começar, você precisa ter instalado:

- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- Um dispositivo físico ou emulador (Android/iOS)

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/Correa4Real/notifiner.git
cd notifiner
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm start
```

## 📱 Executando o App

### Android
```bash
npm run android
```

### iOS
```bash
npm run ios
```

### Web
```bash
npm run web
```

## 📁 Estrutura do Projeto

```
notifications-app/
├── app/                    # Rotas do Expo Router
│   ├── _layout.tsx        # Layout principal
│   ├── index.tsx          # Tela inicial (lista de apps)
│   └── app-details.tsx    # Tela de detalhes do app
├── components/            # Componentes reutilizáveis
│   ├── SoundSelector.tsx  # Seletor de sons
│   └── VolumeSlider.tsx   # Controle de volume
├── constants/            # Constantes do projeto
│   └── theme.ts          # Tema e estilos
├── services/             # Serviços e lógica de negócio
│   ├── notificationService.ts  # Gerenciamento de notificações
│   └── permissionService.ts    # Gerenciamento de permissões
├── types/                # Definições de tipos TypeScript
│   └── index.ts
└── utils/               # Utilitários
```

## 🎨 Funcionalidades

### Tela Principal
- Lista de todos os aplicativos instalados
- Toggle rápido para ativar/desativar notificações
- Navegação para detalhes de cada app

### Tela de Detalhes
- Configurações completas por aplicativo:
  - Ativar/desativar notificações
  - Controle de volume (slider)
  - Seleção de som de notificação
  - Controle de vibração
  - Definição de prioridade (baixa, normal, alta)

## 🔐 Permissões

O aplicativo requer as seguintes permissões:

### Android
- `POST_NOTIFICATIONS` - Para gerenciar notificações
- `VIBRATE` - Para controlar vibração
- `RECEIVE_BOOT_COMPLETED` - Para manter configurações após reinicialização

### iOS
- Notificações do usuário - Para gerenciar notificações

## 🛠️ Desenvolvimento

### Scripts Disponíveis

- `npm start` - Inicia o servidor de desenvolvimento Expo
- `npm run android` - Executa no Android
- `npm run ios` - Executa no iOS
- `npm run web` - Executa na web

### Configuração do Ambiente

O projeto utiliza Expo, então não é necessário configurar Android Studio ou Xcode para desenvolvimento básico. Basta ter o Expo Go instalado no seu dispositivo.

## 📝 Licença

Este projeto é privado e de uso pessoal.

## 👤 Autor

**Correa4Real**

- GitHub: [@Correa4Real](https://github.com/Correa4Real)

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir uma issue ou enviar um pull request.

## 📄 Status do Projeto

🚧 Em desenvolvimento ativo

---

Desenvolvido com ❤️ usando React Native e Expo

