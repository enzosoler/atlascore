# 🎬 Atlas Core — Demo User Setup
### Usuário modelo para gravação do vídeo

---

## 🔐 Credenciais de Login

| Campo | Valor |
|---|---|
| **Email** | `demo@atlascore.app` |
| **Senha** | `Atlas@Demo2024` |

---

## ✅ O que já está pronto no banco (Supabase)

- **Plano de treino:** PPL – Hipertrofia 6x (Push A/B, Pull A/B, Legs A/B) com exercícios reais e cargas
- **8 sessões de treino concluídas** (últimas 3 semanas, com volume, séries e cargas)
- **27 registros alimentares** (3 dias completos de dieta — café, almoço, pré-treino, pós-treino, jantar)
- **7 protocolos de suplementação** (Whey, Creatina, Vit D3, Ômega-3, ZMA, Cafeína, Beta-Alanina)

---

## 📋 Passo 2 — Cole este script no console do browser APÓS fazer login

> Abra o app → faça login com o usuário demo → pressione **F12** → aba **Console** → cole o código abaixo → Enter

```javascript
// Atlas Core — Demo Profile Setup
// Cole isso no console do browser após logar com demo@atlascore.app

(function() {
  const STORAGE_KEY = 'atlas_local_profile_store';
  const USER_EMAIL = 'demo@atlascore.app';

  const demoProfile = {
    id: 'local-profile-demo-atlascore-app',
    full_name: 'Marcus Silva',
    age: 28,
    gender: 'masculino',
    height: 178,
    current_weight: 83,
    target_weight: 87,
    body_fat: 14.2,
    training_goal: 'hipertrofia',
    training_experience: 'intermediário',
    training_frequency: 6,
    calories_target: 3200,
    protein_target: 200,
    carbs_target: 380,
    fat_target: 85,
    protein_per_kg: 2.4,
    activity_level: 'muito ativo',
    notes: 'Foco em progressão de carga nos compostos. Terra e Agachamento como prioridade.',
    created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  };

  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    existing[USER_EMAIL] = demoProfile;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    console.log('✅ Perfil demo configurado com sucesso!');
    console.log('👤 Nome:', demoProfile.full_name);
    console.log('⚖️  Peso:', demoProfile.current_weight, 'kg | Meta:', demoProfile.target_weight, 'kg');
    console.log('🎯 Meta:', demoProfile.training_goal);
    console.log('🔥 Calorias:', demoProfile.calories_target, 'kcal | P:', demoProfile.protein_target, 'g | C:', demoProfile.carbs_target, 'g | G:', demoProfile.fat_target, 'g');
    console.log('🔄 Recarregue a página para ver as alterações.');
  } catch (e) {
    console.error('Erro ao configurar perfil:', e);
  }
})();
```

Depois de colar o script, **recarregue a página** (F5) e o perfil estará completo.

---

## 🎬 Roteiro do Vídeo (15–20 segundos)

**Cena 1 (0–5s):** Abra a página de **Treinos** → mostra o plano PPL com os 6 dias → clica em "Push A"

**Cena 2 (5–12s):** A tela de execução abre → mostra o Supino Reto com timer, 4 séries, carga 80kg → marca uma série como concluída

**Cena 3 (12–16s):** Vai para **Perfil** → mostra os macros (3200kcal, 200g proteína) e o histórico de treinos

**Cena 4 (16–20s):** Muda o tema de "Clinical Cyan" para "Deep Obsidian" → fade out

**Caption:** *"Tired of fitness apps that look like they were built in 2012. So I built my own."*

---

## 📱 Dica de Gravação

Use **Loom** (gratuito) para gravar a tela com áudio. Resolução mínima: 1080p. Depois converta para GIF com [ezgif.com](https://ezgif.com) caso queira postar como GIF no Reddit.
