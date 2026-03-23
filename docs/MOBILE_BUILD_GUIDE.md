# Preparação para Build iOS e Android - atlas.core

## Resumo

Este documento separa os **ajustes feitos automaticamente no código** dos **passos manuais necessários nas lojas** (App Store e Google Play Store).

---

## Ajustes Feitos no Código (Automáticos)

Os seguintes arquivos foram criados ou modificados para preparar o projeto para builds mobile:

### 1. Dependências Adicionadas (`package.json`)
```bash
npm install @capacitor/core @capacitor/ios @capacitor/android @capacitor/cli --save
```

- `@capacitor/core` - Core do Capacitor para bridge nativa
- `@capacitor/ios` - Plataforma iOS
- `@capacitor/android` - Plataforma Android
- `@capacitor/cli` - CLI do Capacitor

### 2. Scripts de Build Mobile (`package.json`)
Novos scripts adicionados:
- `build:mobile` - Build web + sincronização com plataformas nativas
- `cap:add:ios` - Adicionar plataforma iOS (já executado)
- `cap:add:android` - Adicionar plataforma Android (já executado)
- `cap:sync` - Sincronizar código web com plataformas
- `cap:open:ios` - Abrir projeto no Xcode
- `cap:open:android` - Abrir projeto no Android Studio
- `mobile:build:ios` - Build completo + abrir Xcode
- `mobile:build:android` - Build completo + abrir Android Studio

### 3. Configuração Capacitor (`capacitor.config.json`)
Arquivo criado com:
- **App ID**: `com.atlascore.app` (para identificação nas lojas)
- **App Name**: `atlas.core`
- **Web Dir**: `dist` (output do Vite build)
- **Configurações de Splash Screen**: Tema escuro (#05070A)
- **Configurações de Status Bar**: Estilo dark, cor de fundo #05070A
- **Keyboard**: Resize automático, estilo dark

### 4. Configuração Vite Atualizada (`vite.config.js`)
Modificações:
- `base: './'` - Caminhos relativos para assets (necessário para mobile)
- `build.outDir: 'dist'` - Diretório de saída alinhado com Capacitor
- `build.assetsDir: 'assets'` - Organização de assets
- `build.emptyOutDir: true` - Limpar diretório antes do build

### 5. Meta Tags Mobile (`index.html`)
Adicionados:
- `maximum-scale=1, user-scalable=no` - Prevenir zoom em inputs
- `mobile-web-app-capable: yes` - Modo app Android
- `apple-mobile-web-app-capable: yes` - Modo app iOS
- `apple-mobile-web-app-status-bar-style: black-translucent` - Status bar iOS
- `apple-mobile-web-app-title: atlas.core` - Título ao adicionar à home

### 6. Plataformas Nativas Criadas
Diretórios gerados:
- `ios/` - Projeto Xcode completo
- `android/` - Projeto Android Studio completo

---

## Passos Manuais nas Lojas

### iOS - App Store

#### Pré-requisitos
- [ ] macOS com Xcode 15+ instalado
- [ ] Apple Developer Account ($99/ano)
- [ ] Dispositivo iOS para testes (opcional, mas recomendado)

#### Passos no Xcode (Código)

1. **Abrir projeto iOS**:
   ```bash
   npm run cap:open:ios
   # ou
   npx cap open ios
   ```

2. **Configurar Signing & Capabilities**:
   - Selecionar target "App"
   - Aba "Signing & Capabilities"
   - Selecionar seu Team (Apple ID com Developer Program)
   - Bundle Identifier: `com.atlascore.app` (ou alterar se necessário)

3. **Configurar App Icons**:
   - Abrir `ios/App/App/Assets.xcassets`
   - Adicionar ícones em todos os tamanhos necessários:
     - 20pt, 29pt, 40pt, 60pt (2x e 3x)
     - 1024pt (App Store)
   - **Nota**: Ícones podem ser gerados em [appicon.co](https://appicon.co)

4. **Configurar Launch Screen**:
   - Verificar `ios/App/App/LaunchScreen.storyboard`
   - Personalizar com logo/branding se necessário

5. **Testar no Simulador**:
   - Selecionar simulador (iPhone 15 Pro, por exemplo)
   - Pressionar ▶️ (Run)

6. **Testar em Dispositivo Físico** (opcional mas recomendado):
   - Conectar iPhone via USB
   - Selecionar dispositivo no Xcode
   - Resolver problemas de provisioning se aparecerem

#### Passos no App Store Connect (Web)

1. **Acessar** [App Store Connect](https://appstoreconnect.apple.com)

2. **Criar novo app**:
   - My Apps > Adicionar (+) > Novo App
   - Nome: `atlas.core`
   - Idioma primário: Português ou Inglês
   - Bundle ID: `com.atlascore.app`
   - SKU: `atlascore2024`

3. **Preencher informações do app**:
   - Subtítulo (30 caracteres)
   - Categoria: Saúde e Fitness
   - URL de suporte (obrigatório)
   - URL de marketing (opcional)
   - Descrição (promocional)
   - Palavras-chave

4. **Preparar assets gráficos**:
   - **Screenshots** (obrigatórios):
     - 6.7" (iPhone 15 Pro Max): 1290x2796px
     - 6.5" (iPhone 14 Plus): 1284x2778px
     - 5.5" (iPhone 8 Plus): 1242x2208px
     - iPad Pro (6ª gen): 2048x2732px
   - **App Preview** (opcional): Vídeo de até 30 seg

5. **Configurar Preços e Disponibilidade**:
   - Preço: Gratuito ou valor definido
   - Disponibilidade: Todos os países ou selecionar

6. **Configurar App Privacy**:
   - Preencher Privacy Nutrition Labels
   - atlas.core provavelmente coleta:
     - Health & Fitness (dados de treino, nutrição)
     - Contact Info (email, nome)
     - User Content (fotos de progresso)
     - Identifiers (user ID)

7. **Submeter para revisão**:
   - No Xcode: Product > Archive
   - Distribute App > App Store Connect > Upload
   - Aguardar processamento (15-30 min)
   - Em App Store Connect, selecionar build
   - Adicionar notas de release
   - Enviar para revisão da Apple (1-2 dias úteis)

---

### Android - Google Play Store

#### Pré-requisitos
- [ ] Android Studio instalado
- [ ] Conta Google Play Console ($25 único)
- [ ] Dispositivo Android para testes (ou emulador)

#### Passos no Android Studio (Código)

1. **Abrir projeto Android**:
   ```bash
   npm run cap:open:android
   # ou
   npx cap open android
   ```

2. **Configurar App Icons**:
   - Local: `android/app/src/main/res/`
   - Pastas:
     - `mipmap-mdpi/` (48x48)
     - `mipmap-hdpi/` (72x72)
     - `mipmap-xhdpi/` (96x96)
     - `mipmap-xxhdpi/` (144x144)
     - `mipmap-xxxhdpi/` (192x192)
   - Arquivos: `ic_launcher.png` e `ic_launcher_foreground.png`
   - Ícone adaptável: `ic_launcher.xml` e `ic_launcher_round.xml`
   - **Nota**: Gerar em [Android Asset Studio](https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html)

3. **Configurar Splash Screen**:
   - Tema já configurado em `capacitor.config.json`
   - Verificar `android/app/src/main/res/values/styles.xml`

4. **Configurar nome do app**:
   - Editar `android/app/src/main/res/values/strings.xml`
   - `<string name="app_name">atlas.core</string>`

5. **Testar em Emulador**:
   - Criar emulador Android Studio (Pixel 7, API 33+)
   - Pressionar ▶️ (Run 'app')

6. **Testar em Dispositivo Físico**:
   - Habilitar Developer Options no Android
   - Habilitar USB Debugging
   - Conectar via USB
   - Selecionar dispositivo no Android Studio

#### Gerar Keystore (Importante!)

O keystore é ESSENCIAL - sem ele você não pode atualizar o app no futuro:

```bash
cd android/app
keytool -genkey -v -keystore atlascore.keystore -alias atlascore -keyalg RSA -keysize 2048 -validity 10000
```

- Senha: Definir senha forte (GUARDAR EM LOCAL SEGURO)
- Dados pessoais: Preencher nome, organização, etc.
- **BACKUP**: Fazer backup do arquivo `atlascore.keystore` em local seguro

#### Configurar Build Signed (Android Studio)

1. **Abrir Build > Generate Signed Bundle/APK**
2. **Selecionar Android App Bundle (.aab)** - Formato obrigatório para Play Store
3. **Configurar keystore**:
   - Path: `android/app/atlascore.keystore`
   - Password: (senha definida acima)
   - Alias: `atlascore`
   - Alias password: (mesma senha)
4. **Selecionar build variant**: `release`
5. **Clicar Finish** - Arquivo `.aab` será gerado em `android/app/release/`

#### Passos no Google Play Console (Web)

1. **Acessar** [Google Play Console](https://play.google.com/console)

2. **Criar novo app**:
   - Clicar "Criar aplicativo"
   - Nome do app: `atlas.core`
   - Idioma padrão: Português (Brasil) ou Inglês
   - Tipo de app: App
   - Preço: Gratuito ou Pago
   - Aceitar declarações

3. **Painel do app - Configurar**:
   
   **a) Detalhes do app**:
   - Descrição curta (80 caracteres)
   - Descrição completa (4000 caracteres)
   - Gráficos:
     - Ícone (512x512 PNG)
     - Imagem destacada (1024x500 PNG)
     - Screenshots (mínimo 2, máximo 8 por dispositivo):
       - Telefone: 1080x1920, 1080x2160, etc.
       - Tablet: 2048x2732, etc.
   
   **b) Classificação de conteúdo**:
   - Preencher questionário sobre conteúdo
   - atlas.core provavelmente: "Não" para violência, drogas, etc.
   - Classificação esperada: L (Livre) ou +10

4. **Configurar assinatura do app** (Play App Signing):
   - Opção recomendada: "Usar assinatura de app do Google Play"
   - Upload do keystore ou exportar chave de criptografia
   - **IMPORTANTE**: Google pode guardar a chave de assinatura para você

5. **Criar release**:
   - Menu lateral: "Produção" > "Criar nova release"
   - Upload do arquivo `.aab` gerado
   - Notas de release

6. **Configurar privacidade**:
   - Política de privacidade (URL obrigatória)
   - Formulário de segurança de dados:
     - Tipos de dados coletados (email, fotos, dados de saúde)
     - Uso dos dados
     - Compartilhamento com terceiros (Stripe, Supabase, etc.)

7. **Configurar preço e distribuição**:
   - Países: Selecionar onde distribuir
   - Programa Designed for Families (se aplicável)

8. **Enviar para revisão**:
   - Revisar todas as seções (devem estar ✅)
   - Enviar para revisão (1-7 dias úteis)

---

## Comandos Úteis

### Desenvolvimento
```bash
# Build web + sync com nativo
npm run build:mobile

# Apenas build web
npm run build

# Sync código web com plataformas
npm run cap:sync
```

### iOS
```bash
# Abrir no Xcode
npm run cap:open:ios

# Build completo iOS
npm run mobile:build:ios
```

### Android
```bash
# Abrir no Android Studio
npm run cap:open:android

# Build completo Android
npm run mobile:build:android
```

---

## Checklist Pré-Submissão

### iOS
- [ ] Build funciona no simulador
- [ ] Build funciona em dispositivo físico (se possível)
- [ ] App icons em todos os tamanhos
- [ ] Screenshots preparados para App Store Connect
- [ ] Descrição e palavras-chave escritas
- [ ] URL de suporte criada
- [ ] Privacy labels preenchidos
- [ ] Conta Apple Developer ativa ($99/ano)

### Android
- [ ] Build funciona em emulador
- [ ] Build funciona em dispositivo físico (se possível)
- [ ] App icons em todas as densidades
- [ ] Keystore gerado e BACKUP feito
- [ ] AAB release build gerado
- [ ] Screenshots preparados
- [ ] Descrição curta e longa escritas
- [ ] Política de privacidade URL
- [ ] Formulário de segurança de dados preenchido
- [ ] Conta Google Play Console ativa ($25 único)

---

## Arquivos Críticos para Backup

Antes de qualquer submissão, fazer backup dos seguintes arquivos:

1. **Keystore Android**: `android/app/atlascore.keystore`
   - Sem este arquivo, você NÃO pode atualizar o app no futuro

2. **Provisioning Profiles iOS**: (gerenciados pela Apple, mas verificar acesso à conta)

---

## Notas Importantes

- **Atualizações**: Após a primeira submissão, atualizações seguem o mesmo fluxo mas são mais rápidas (horas vs dias)
- **Rejeições**: É comum ser rejeitado na primeira tentativa. Motivos comuns:
  - App quebra em certo cenário
  - Informações de privacidade incompletas
  - Descrição enganosa
  - Falta de URL de suporte
- **Teste beta**: Ambas as lojas oferecem teste beta interno/externo antes do lançamento oficial
