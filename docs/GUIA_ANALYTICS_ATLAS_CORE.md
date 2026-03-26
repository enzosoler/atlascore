# Guia Completo: Analytics no atlas.core (iOS + Android + Web)

Eu já fiz toda a parte de código pra você. O que falta agora é **criar o projeto no Firebase** e **baixar 3 arquivos de configuração** (um pra cada plataforma). Este guia vai te levar pela mão em cada clique.

---

## O que já foi feito no código (você NÃO precisa mexer nisso)

| Arquivo | O que faz |
|---------|-----------|
| `src/lib/analytics.js` | Módulo central que envia eventos para o Firebase |
| `src/hooks/useAnalytics.js` | Hook React para usar analytics nos componentes |
| `src/components/AnalyticsProvider.jsx` | Componente que inicializa tudo e rastreia page views automaticamente |
| `src/App.jsx` | Atualizado para incluir o AnalyticsProvider |
| `src/lib/AuthContext.jsx` | Adicionado tracking de login e signup |
| `capacitor.config.json` | Adicionada config do plugin Firebase Analytics |
| `android/variables.gradle` | Adicionada versão do Firebase Analytics |
| `netlify.toml` | CSP atualizado para permitir conexões do Firebase |
| `.env.analytics.example` | Template das variáveis de ambiente para a Web |

---

## O que VOCÊ precisa fazer (passo a passo)

### PARTE 1: Criar o Projeto no Firebase

**Passo 1.1** — Abra o navegador e vá para:

> **https://console.firebase.google.com**

**Passo 1.2** — Faça login com sua conta Google (a mesma que você usa no dia a dia serve).

**Passo 1.3** — Clique no botão grande **"Criar um projeto"** (ou "Add project" se estiver em inglês).

**Passo 1.4** — Digite o nome do projeto: **atlas-core** e clique em **Continuar**.

**Passo 1.5** — Na tela seguinte, vai perguntar sobre o **Google Analytics**. **DEIXE ATIVADO** (é o botão toggle azul). Clique em **Continuar**.

**Passo 1.6** — Selecione ou crie uma conta do Google Analytics (pode usar a "Default Account for Firebase"). Clique em **Criar projeto**.

**Passo 1.7** — Espere uns 30 segundos. Quando aparecer "Seu novo projeto está pronto", clique em **Continuar**.

Pronto! Você agora tem um projeto Firebase com Analytics ativado.

---

### PARTE 2: Configurar o Android

**Passo 2.1** — Dentro do seu projeto no Firebase, na tela inicial, procure os ícones de plataforma. Clique no ícone do **Android** (o robozinho verde).

Se não aparecer na tela inicial, clique na **engrenagem** (ao lado de "Project Overview") e depois em **Project settings**. Role para baixo até "Your apps" e clique em **Add app** e depois **Android**.

**Passo 2.2** — No campo **"Android package name"**, digite exatamente:

```
com.atlascore.app
```

**Passo 2.3** — No campo **"App nickname"**, digite: `Atlas Core Android` (opcional, é só um nome para você identificar).

**Passo 2.4** — Clique em **Register app**.

**Passo 2.5** — Vai aparecer um botão **"Download google-services.json"**. **CLIQUE NELE** e salve o arquivo.

**Passo 2.6** — Agora pegue esse arquivo `google-services.json` que você acabou de baixar e **coloque ele dentro da pasta**:

```
atlas.core/android/app/
```

Ou seja, o caminho final do arquivo deve ser:

```
atlas.core/android/app/google-services.json
```

**Passo 2.7** — De volta no Firebase, clique em **Next**, **Next**, **Continue to console** (pode pular os outros passos, o código já está pronto).

Android configurado!

---

### PARTE 3: Configurar o iOS

**Passo 3.1** — Ainda no Firebase Console, vá para **Project settings** (engrenagem ao lado de "Project Overview").

**Passo 3.2** — Role para baixo até "Your apps" e clique em **Add app**.

**Passo 3.3** — Clique no ícone da **Apple** (a maçã).

**Passo 3.4** — No campo **"Apple bundle ID"**, digite exatamente:

```
com.atlascore.app
```

**Passo 3.5** — No campo **"App nickname"**, digite: `Atlas Core iOS` (opcional).

**Passo 3.6** — Clique em **Register app**.

**Passo 3.7** — Vai aparecer um botão **"Download GoogleService-Info.plist"**. **CLIQUE NELE** e salve o arquivo.

**Passo 3.8** — Agora você precisa adicionar esse arquivo ao projeto iOS **pelo Xcode**. Faça assim:

1. Abra o Terminal na pasta do projeto e rode:
   ```bash
   npx cap open ios
   ```
2. O Xcode vai abrir.
3. No painel da esquerda do Xcode, procure a pasta amarela chamada **"App"**.
4. **Clique com o botão direito** na pasta "App" e selecione **"Add Files to App..."**.
5. Navegue até onde você salvou o `GoogleService-Info.plist`, selecione ele.
6. **IMPORTANTE**: Marque a caixinha **"Copy items if needed"** e certifique-se que o target **"App"** está selecionado.
7. Clique em **Add**.

**Passo 3.9** — De volta no Firebase, clique em **Next**, **Next**, **Continue to console**.

iOS configurado!

---

### PARTE 4: Configurar a Web

**Passo 4.1** — Ainda no Firebase Console, vá para **Project settings** (engrenagem).

**Passo 4.2** — Role para baixo até "Your apps" e clique em **Add app**.

**Passo 4.3** — Clique no ícone de **Web** (o símbolo `</>`).

**Passo 4.4** — No campo **"App nickname"**, digite: `Atlas Core Web`.

**Passo 4.5** — **NÃO** marque "Firebase Hosting" (não precisamos disso).

**Passo 4.6** — Clique em **Register app**.

**Passo 4.7** — Vai aparecer um bloco de código com o `firebaseConfig`. Vai ter algo assim:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyB...",
  authDomain: "atlas-core-xxxxx.firebaseapp.com",
  projectId: "atlas-core-xxxxx",
  storageBucket: "atlas-core-xxxxx.firebasestorage.app",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890",
  measurementId: "G-XXXXXXXXXX"
};
```

**NÃO FECHE ESSA TELA AINDA!** Você vai precisar desses valores.

**Passo 4.8** — Abra o arquivo `.env.local` na **raiz** do projeto `atlas.core`. Se ele não existir, crie um novo arquivo chamado `.env.local`.

**Passo 4.9** — Cole as seguintes linhas, **substituindo cada valor** pelo que apareceu na tela do Firebase:

```env
VITE_FIREBASE_API_KEY=AIzaSyB...
VITE_FIREBASE_AUTH_DOMAIN=atlas-core-xxxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=atlas-core-xxxxx
VITE_FIREBASE_STORAGE_BUCKET=atlas-core-xxxxx.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

**Passo 4.10** — Salve o arquivo.

**Passo 4.11** — Se você faz deploy na **Vercel**, vá no painel da Vercel, entre no projeto atlas.core, vá em **Settings > Environment Variables** e adicione essas mesmas 7 variáveis lá também.

Web configurado!

---

### PARTE 5: Instalar o Plugin e Testar

**Passo 5.1** — Abra o Terminal na pasta do projeto `atlas.core`.

**Passo 5.2** — Rode este comando para instalar o plugin:

```bash
npm install @capacitor-community/firebase-analytics
```

**Passo 5.3** — Rode este comando para sincronizar com os projetos nativos:

```bash
npx cap sync
```

**Passo 5.4** — Para testar na **Web**, rode:

```bash
npm run dev
```

Abra o navegador, navegue pelo app, e depois vá no Firebase Console em **Analytics > Realtime** (pode demorar uns minutos para aparecer os primeiros dados).

**Passo 5.5** — Para testar no **Android**:

```bash
npm run build && npx cap sync android && npx cap open android
```

No Android Studio, rode o app no emulador ou no seu celular.

**Passo 5.6** — Para testar no **iOS**:

```bash
npm run build && npx cap sync ios && npx cap open ios
```

No Xcode, rode o app no simulador ou no seu iPhone.

---

### PARTE 6: Verificar se está funcionando

**Passo 6.1** — Vá no Firebase Console: **https://console.firebase.google.com**

**Passo 6.2** — Clique no seu projeto **atlas-core**.

**Passo 6.3** — No menu da esquerda, clique em **Analytics** e depois em **Realtime**.

**Passo 6.4** — Se você navegou pelo app nos últimos 30 minutos, deve aparecer pelo menos **1 usuário ativo** e os eventos `page_view`.

Se não aparecer nada, espere até 24 horas (o Firebase pode demorar para processar os primeiros eventos).

---

## Resumo: Checklist Final

| Plataforma | O que você precisa fazer | Onde colocar |
|------------|--------------------------|--------------|
| **Android** | Baixar `google-services.json` do Firebase | `atlas.core/android/app/google-services.json` |
| **iOS** | Baixar `GoogleService-Info.plist` do Firebase | Adicionar pelo Xcode na pasta "App" |
| **Web** | Copiar as chaves do Firebase Config | Arquivo `.env.local` na raiz do projeto |
| **Todas** | Rodar `npm install @capacitor-community/firebase-analytics` | Terminal |
| **Todas** | Rodar `npx cap sync` | Terminal |

---

## Como usar analytics no código (para quando quiser rastrear coisas novas)

O tracking de **page views** (qual tela o usuário está vendo) e **login/signup** já está funcionando automaticamente. Se você quiser rastrear algo a mais, use assim:

```jsx
import { useAnalytics } from '@/hooks/useAnalytics';

function QualquerComponente() {
  const { logEvent, trackWorkoutCompleted } = useAnalytics();

  const handleClick = () => {
    // Evento customizado
    logEvent('botao_clicado', { qual: 'salvar_treino' });
    
    // Ou use um helper pronto
    trackWorkoutCompleted({ duracao: 45, volume: 5000 });
  };

  return <button onClick={handleClick}>Salvar</button>;
}
```

Eventos disponíveis prontos para usar:

| Método | Quando usar |
|--------|-------------|
| `trackWorkoutCompleted(params)` | Quando o usuário finaliza um treino |
| `trackFoodLogged(params)` | Quando o usuário registra uma refeição |
| `trackMeasurementRecorded(params)` | Quando o usuário registra uma medida |
| `trackOnboardingStep(step, params)` | Em cada etapa do onboarding |
| `trackSubscription(action, params)` | Checkout, upgrade, cancelamento |
| `trackFeatureUsed(feature, params)` | Quando o usuário usa uma feature específica |
| `trackShare(contentType, itemId, method)` | Quando o usuário compartilha algo |
| `logEvent(nome, params)` | Para qualquer evento customizado |
