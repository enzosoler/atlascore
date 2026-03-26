# Configuração do Firebase Analytics (Multiplataforma)

A infraestrutura de analytics foi implementada no projeto utilizando o plugin oficial da comunidade Capacitor (`@capacitor-community/firebase-analytics`). Esta solução unificada funciona nativamente no iOS e Android, e utiliza o Firebase JS SDK na Web.

Para que os eventos comecem a ser registrados no seu painel do Firebase, você precisa concluir a configuração criando os aplicativos no Firebase Console e adicionando as chaves ao projeto.

## Passo 1: Criar o Projeto no Firebase

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Clique em **Adicionar projeto** (ou selecione um existente)
3. Siga os passos e **certifique-se de ativar o Google Analytics** para o projeto

---

## Passo 2: Configurar a Web

1. No painel do Firebase, clique no ícone **Web** (`</>`) para adicionar um app web
2. Registre o app com o nome "Atlas Core Web"
3. O Firebase fornecerá um objeto `firebaseConfig`. Copie esses valores.
4. No projeto `atlas.core`, crie ou edite o arquivo `.env.local` na raiz do projeto
5. Adicione as seguintes variáveis (substituindo pelos seus valores):

```env
VITE_FIREBASE_API_KEY=sua-api-key
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto-id
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

*(Nota: Um arquivo `.env.analytics.example` foi criado na raiz do projeto como referência).*

---

## Passo 3: Configurar o Android

1. No painel do Firebase, clique em **Adicionar app** e selecione **Android**
2. Insira o nome do pacote: `com.atlascore.app` (conforme definido no seu `capacitor.config.json`)
3. Registre o app e faça o download do arquivo `google-services.json`
4. Coloque este arquivo na pasta `android/app/` do seu projeto:
   `atlas.core/android/app/google-services.json`
5. O código do Android já foi preparado para ler este arquivo automaticamente.

---

## Passo 4: Configurar o iOS

1. No painel do Firebase, clique em **Adicionar app** e selecione **iOS**
2. Insira o Bundle ID: `com.atlascore.app`
3. Registre o app e faça o download do arquivo `GoogleService-Info.plist`
4. Abra o projeto iOS no Xcode (`npx cap open ios`)
5. Arraste o arquivo `GoogleService-Info.plist` para dentro da pasta `App` no Xcode (certifique-se de marcar a opção "Copy items if needed" e selecionar o target "App")
   *Importante: Não basta apenas copiar o arquivo pelo Finder, ele precisa ser adicionado através do Xcode para ser incluído no build.*

---

## Passo 5: Instalar o Plugin e Sincronizar

No terminal, na raiz do projeto, execute:

```bash
npm install @capacitor-community/firebase-analytics
npx cap sync
```

---

## Como usar o Analytics no código

A infraestrutura já está configurada para rastrear automaticamente:
- **Page Views**: Cada mudança de rota é registrada automaticamente com o nome da tela
- **Identificação de Usuário**: Quando o usuário faz login, o ID e a role são associados à sessão
- **Eventos de Auth**: Login e Sign Up já estão sendo rastreados no `AuthContext.jsx`

Para rastrear eventos personalizados nos seus componentes React, use o hook `useAnalytics`:

```jsx
import { useAnalytics } from '@/hooks/useAnalytics';

function MeuComponente() {
  const { logEvent, trackWorkoutCompleted } = useAnalytics();

  const handleFinalizarTreino = () => {
    // Usando um helper pré-definido
    trackWorkoutCompleted({ duration_minutes: 45, volume_kg: 5000 });
    
    // Ou usando um evento customizado
    logEvent('botao_clicado', { nome: 'finalizar_treino' });
  };

  return <button onClick={handleFinalizarTreino}>Finalizar</button>;
}
```

Para usar fora de componentes React (ex: em services ou actions do Redux/Zustand), importe o módulo diretamente:

```javascript
import { analytics } from '@/lib/analytics';

export async function processarPagamento() {
  // ... lógica de pagamento ...
  analytics.trackSubscription('checkout_success', { plan: 'pro_anual' });
}
```
