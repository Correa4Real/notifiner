# Notifiner

Um aplicativo mobile desenvolvido com React Native e Expo para gerenciar notificações de aplicativos instalados no dispositivo. Permite controlar volume, sons, vibração e prioridade das notificações de cada app de forma individualizada, dando controle total sobre como cada aplicativo se comporta em relação ao modo do celular (silencioso, vibração ou normal).

## 📱 Sobre o Projeto

O Notifiner oferece uma interface intuitiva e moderna para gerenciar todas as notificações do seu dispositivo em um único lugar. Com este app, você pode:

- Visualizar todos os aplicativos instalados
- Ativar/desativar notificações por app
- Configurar volume individual para cada app
- Escolher sons de notificação personalizados
- Controlar vibração por aplicativo
- Definir prioridade de notificações (baixa, normal, alta)
- **Enganar o sistema**: Fazer cada app pensar que o celular está em um modo diferente (silencioso, vibração ou normal), permitindo:
  - Remover som de um app mas manter vibração
  - Remover som e vibração mas continuar recebendo notificações na tela
  - Personalizar completamente o comportamento de cada app independente do modo do celular

## 🚀 Tecnologias Utilizadas

- **React Native** - Framework para desenvolvimento mobile
- **Expo** - Plataforma e ferramentas para desenvolvimento React Native
- **Expo Router** - Roteamento baseado em arquivos
- **TypeScript** - Tipagem estática para JavaScript
- **Expo Notifications** - Gerenciamento de notificações
- **Expo Secure Store** - Armazenamento seguro de dados
- **Expo AV** - Reprodução de áudio
- **Módulo Nativo Android** - Para listar apps instalados e interceptar notificações

## 📋 Pré-requisitos

Antes de começar, você precisa ter instalado:

- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- Um dispositivo físico ou emulador (Android/iOS)
- **Android Studio** (para builds nativos e desenvolvimento do módulo nativo)

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

3. Para desenvolvimento com módulo nativo, execute:
```bash
npx expo prebuild
```

4. Inicie o servidor de desenvolvimento:
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
notifiner/
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
│   ├── permissionService.ts    # Gerenciamento de permissões
│   └── installedAppsService.ts # Serviço de apps instalados
├── modules/               # Módulos nativos
│   ├── InstalledAppsModule.ts
│   ├── InstalledAppsModuleNative.ts
│   └── NativeInstalledAppsModule.ts
├── android/              # Código nativo Android
│   └── app/src/main/java/com/notificationmanager/app/
│       ├── InstalledAppsModule.kt
│       └── InstalledAppsPackage.kt
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

### Funcionalidade Principal: "Enganar o Sistema"

O Notifiner permite que cada aplicativo pense que o celular está em um modo diferente do real:

- **Modo Silencioso Personalizado**: Um app pode ter som desativado mas vibração ativada
- **Modo Vibração Personalizado**: Um app pode ter vibração desativada mas som ativado
- **Modo Normal Personalizado**: Um app pode ter som e vibração desativados mas continuar mostrando notificações na tela

Isso é possível através de um `NotificationListenerService` no Android que intercepta as notificações antes de serem exibidas e modifica suas propriedades (som, vibração, prioridade) baseado nas configurações salvas no Notifiner.

## 🔐 Permissões

O aplicativo requer as seguintes permissões:

### Android
- `POST_NOTIFICATIONS` - Para gerenciar notificações
- `QUERY_ALL_PACKAGES` (Android 11+) - Para listar todos os apps instalados
- `BIND_NOTIFICATION_LISTENER_SERVICE` - Para interceptar notificações (requer configuração manual nas configurações do sistema)
- `VIBRATE` - Para controlar vibração
- `RECEIVE_BOOT_COMPLETED` - Para manter configurações após reinicialização

### iOS
- Notificações do usuário - Para gerenciar notificações
- **Nota**: A interceptação de notificações no iOS é mais limitada devido às restrições do sistema

## 🛠️ Desenvolvimento

### Scripts Disponíveis

- `npm start` - Inicia o servidor de desenvolvimento Expo
- `npm run android` - Executa no Android
- `npm run ios` - Executa no iOS
- `npm run web` - Executa na web

### Configuração do Módulo Nativo

O projeto utiliza um módulo nativo customizado para:
1. Listar aplicativos instalados
2. Obter ícones dos aplicativos
3. Interceptar notificações (em desenvolvimento)

Para mais detalhes, consulte [NATIVE_MODULE_SETUP.md](./NATIVE_MODULE_SETUP.md)

### Configuração do Ambiente

O projeto utiliza Expo com módulos nativos, então é necessário:
1. Executar `npx expo prebuild` para gerar os arquivos nativos
2. Ter Android Studio instalado para builds Android
3. Para desenvolvimento básico, pode usar Expo Go (mas sem módulos nativos)

## 🔮 Funcionalidades Futuras

- [ ] Implementação completa do NotificationListenerService para interceptar notificações
- [ ] Suporte para regras avançadas (horários, localização, etc)
- [ ] Modo "Não Perturbe" personalizado por app
- [ ] Histórico de notificações
- [ ] Estatísticas de uso de notificações
- [ ] Suporte completo para iOS

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
