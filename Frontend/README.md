# SeedUp Frontend

Aplicativo Expo/React Native do SeedUp.

## Como rodar

```bash
npm install
npm start
```

Tambem e possivel iniciar por plataforma:

```bash
npm run android
npm run ios
npm run web
```

## API

O app usa `EXPO_PUBLIC_API_URL` no arquivo `.env` para se conectar ao backend Laravel.

## Validacao

```bash
npx tsc --noEmit
npm run lint
```
