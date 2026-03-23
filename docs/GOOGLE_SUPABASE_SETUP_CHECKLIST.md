# Checklist de Configuração - Google OAuth, CAPTCHA e Supabase

## 1. Google Cloud Console (OAuth 2.0)

### Criar Projeto ou Usar Existente
- [ ] Acesse https://console.cloud.google.com/
- [ ] Selecione ou crie um projeto para o Atlas Core

### Configurar Tela de Consentimento OAuth
- [ ] Vá em "APIs & Services" > "OAuth consent screen"
- [ ] Selecione tipo de usuário: "External" (para produção) ou "Internal" (se for Google Workspace)
- [ ] Preencha:
  - App name: `Atlas Core`
  - User support email: seu email
  - Developer contact information: seu email
- [ ] Adicione scopes: `openid`, `email`, `profile`
- [ ] Adicione test users (para modo de teste)
- [ ] Submit for verification (quando estiver pronto para produção)

### Criar Credenciais OAuth 2.0
- [ ] Vá em "APIs & Services" > "Credentials"
- [ ] Clique "Create Credentials" > "OAuth client ID"
- [ ] Selecione "Web application"
- [ ] Configure:
  - Name: `Atlas Core Web Client`
  - Authorized JavaScript origins:
    - `http://localhost:5173` (desenvolvimento)
    - `https://seu-dominio.com` (produção)
  - Authorized redirect URIs:
    - `http://localhost:5173/auth/callback` (desenvolvimento)
    - `https://seu-dominio.com/auth/callback` (produção)
- [ ] Copie o **Client ID** e **Client Secret**

---

## 2. Supabase (Auth Settings)

### Configurar Provedor Google
- [ ] Acesse https://supabase.com/dashboard
- [ ] Selecione seu projeto
- [ ] Vá em "Authentication" > "Providers"
- [ ] Encontre "Google" e clique em "Enable"
- [ ] Preencha:
  - Client ID: (do Google Cloud Console)
  - Client Secret: (do Google Cloud Console)
  - Authorized Redirect URI: já está configurado pelo Supabase
- [ ] Salve as configurações

### Configurar Site URL e Redirect URLs
- [ ] Vá em "Authentication" > "URL Configuration"
- [ ] Site URL:
  - Produção: `https://seu-dominio.com`
  - Desenvolvimento: `http://localhost:5173`
- [ ] Redirect URLs (adicione):
  - `http://localhost:5173/auth/callback`
  - `http://localhost:5173/auth/update-password`
  - `https://seu-dominio.com/auth/callback`
  - `https://seu-dominio.com/auth/update-password`

### Configurar Email (SMTP) - Opcional mas recomendado
- [ ] Vá em "Authentication" > "Email Templates"
- [ ] Configure templates de:
  - Confirm signup
  - Reset password
  - Magic link
  - Change email
- [ ] Para produção, configure SMTP próprio:
  - Vá em "Authentication" > "SMTP Settings"
  - Configure com SendGrid, AWS SES, ou outro provedor

### Configurar CAPTCHA (Password Protection)
- [ ] Vá em "Authentication" > "Attack Protection"
- [ ] Habilite "Enable CAPTCHA protection for sign-up, sign-in, and password reset actions"
- [ ] Selecione provider: "Google reCAPTCHA"
- [ ] Adicione o **reCAPTCHA Secret Key** (veja seção 3 abaixo)

---

## 3. Google reCAPTCHA v3

### Criar Chaves reCAPTCHA
- [ ] Acesse https://www.google.com/recaptcha/admin/create
- [ ] Selecione:
  - Label: `Atlas Core`
  - Type: **reCAPTCHA v3**
  - Domains:
    - `localhost` (para testes)
    - `seu-dominio.com` (produção)
- [ ] Aceite os termos e submit
- [ ] Copie:
  - **Site Key** (para o frontend)
  - **Secret Key** (para o Supabase)

### Configurar no Frontend
- [ ] Adicione ao arquivo `.env.local`:
```bash
VITE_RECAPTCHA_SITE_KEY=sua_site_key_aqui
```

### Configurar no Supabase
- [ ] Vá em "Authentication" > "Attack Protection"
- [ ] Cole a **Secret Key** no campo de reCAPTCHA

---

## 4. Variáveis de Ambiente (Frontend)

Crie/Atualize o arquivo `.env.local` na raiz do projeto:

```bash
# Supabase
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key

# Google OAuth (via Supabase - já configurado no dashboard)
# Não precisa adicionar aqui, o Supabase já gerencia

# reCAPTCHA v3
VITE_RECAPTCHA_SITE_KEY=sua_recaptcha_site_key

# Base44 (se estiver usando)
VITE_BASE44_APP_ID=seu_app_id
VITE_BASE44_APP_BASE_URL=https://seu-backend.base44.app
```

**Importante**: Nunca commite o arquivo `.env.local`! Adicione ao `.gitignore`.

---

## 5. Testes

### Testar Forgot Password
- [ ] Vá para `/auth` e clique em "Forgot your password?"
- [ ] Digite um email válido
- [ ] Verifique se o email chegou
- [ ] Clique no link do email
- [ ] Confirme se redireciona para `/auth/update-password`
- [ ] Defina nova senha
- [ ] Tente fazer login com a nova senha

### Testar Login com Google
- [ ] Vá para `/auth`
- [ ] Clique em "Sign in with Google"
- [ ] Selecione conta Google
- [ ] Confirme se redireciona para `/auth/callback`
- [ ] Verifique se login foi bem-sucedido

### Testar CAPTCHA
- [ ] Abra DevTools (F12) > Network tab
- [ ] Tente fazer login ou signup
- [ ] Procure por requisições para `google.com/recaptcha`
- [ ] Verifique se token é enviado no payload

---

## 6. Produção - Checklist Final

- [ ] Domínio principal configurado no Google Cloud Console
- [ ] Domínio principal configurado no Supabase
- [ ] reCAPTCHA v3 configurado para domínio de produção
- [ ] Tela de consentimento OAuth verificada pelo Google
- [ ] Política de privacidade e Termos de uso publicados
- [ ] SMTP configurado para emails de produção
- [ ] Testado em ambiente de staging
- [ ] SSL/HTTPS ativo no domínio

---

## Links Úteis

- Google Cloud Console: https://console.cloud.google.com/
- Supabase Dashboard: https://supabase.com/dashboard
- reCAPTCHA Admin: https://www.google.com/recaptcha/admin
- Supabase Auth Docs: https://supabase.com/docs/guides/auth
- react-google-recaptcha-v3: https://github.com/t49tran/react-google-recaptcha-v3
