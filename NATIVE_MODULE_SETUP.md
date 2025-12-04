# Configuração do Módulo Nativo

Este projeto utiliza um módulo nativo customizado para listar aplicativos instalados e obter seus ícones.

## Requisitos

Para que o módulo nativo funcione, é necessário:

1. **Expo Dev Client**: O projeto precisa ser executado com `expo-dev-client` ou fazer um build nativo
2. **Permissões**: As permissões já estão configuradas no `app.json`

## Estrutura do Módulo Nativo

O módulo nativo está localizado em:
- `android/app/src/main/java/com/notificationmanager/app/InstalledAppsModule.kt`
- `android/app/src/main/java/com/notificationmanager/app/InstalledAppsPackage.kt`

## Como Funciona

1. O módulo nativo usa `PackageManager` do Android para listar apps instalados
2. Filtra apenas apps de usuário (não apps do sistema)
3. Converte os ícones dos apps para Base64 para enviar ao JavaScript
4. O JavaScript recebe a lista e exibe os ícones reais dos apps

## Permissões Necessárias

- `QUERY_ALL_PACKAGES` (Android 11+): Para listar todos os apps instalados
- `POST_NOTIFICATIONS`: Para gerenciar notificações

## Build do App

Para usar o módulo nativo, você precisa fazer um build nativo:

```bash
npx expo prebuild
npx expo run:android
```

Ou usar EAS Build:

```bash
eas build --platform android
```

## Notas

- O módulo nativo só funciona em builds nativos (não funciona no Expo Go)
- iOS requer configuração adicional (não implementado ainda)
- O fallback usa dados mockados se o módulo não estiver disponível

