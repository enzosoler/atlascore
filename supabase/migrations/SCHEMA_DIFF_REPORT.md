# Schema Diff Report: Atlas Core
## Atual vs Esperado — Mar 2026

---

## 1. public.profiles

### ✅ Alinhado
| Coluna | Status |
|--------|--------|
| `id` | ✅ PK, references auth.users(id) |
| `role` | ✅ NOT NULL DEFAULT 'user' |
| `is_suspended` | ✅ NOT NULL DEFAULT false |
| `onboarding_completed` | ✅ NOT NULL DEFAULT false |
| `created_at` | ✅ NOT NULL DEFAULT now() |

### 🔧 Ajustes Necessários
| Coluna | Atual | Esperado | Migration |
|--------|-------|----------|-----------|
| `updated_at` | ❌ Não existe | ✅ NOT NULL DEFAULT now() | `ADD COLUMN` + trigger |

### ℹ️ Colunas Extras (Manter)
- `full_name`, `avatar_url`, `training_goal`, `health_goals`, `activity_level`
- `current_weight`, `target_weight`, `height_cm`, `age`, `sex`
- `calories_target`, `protein_target`, `carbs_target`, `fat_target`, `water_target`
- `dietary_style`, `food_preferences`, `allergies`, `meals_per_day`
- `training_experience`, `training_location`, `training_frequency`
- `training_session_minutes`, `onboarding_done`, `preferred_language`, `language`
- `email_confirmed_at`

---

## 2. public.workout_plans

### ⚠️ Divergências Encontradas
| Coluna | Atual | Esperado | Risco |
|--------|-------|----------|-------|
| `frequency` | `integer NOT NULL DEFAULT 3` | `integer null` | Baixo — apenas flexibilidade |
| `start_date` | `date DEFAULT CURRENT_DATE` | `date null` | Baixo — permite null explícito |

### ✅ Alinhado
- `id`, `user_id`, `name`, `objective`, `days`, `notes`, `active`
- `created_by_type`, `version`, `created_at`

### ✅ Indexes
- `workout_plans_user_active` em `(user_id, active, created_at desc)` — já existe

### ✅ RLS
- CRUD own-row policies — já existem (recriadas para garantir)

---

## 3. public.workouts

### ⚠️ Divergências Encontradas
| Coluna | Atual | Esperado | Risco | Ação |
|--------|-------|----------|-------|------|
| `exercises_completed` | `jsonb DEFAULT '[]'` (nullable) | `jsonb NOT NULL DEFAULT '[]'` | **Médio** — backfill necessário | UPDATE null → '[]', ADD NOT NULL |
| `volume_load` | `numeric(10, 1)` | `numeric null` | Baixo | ALTER TYPE numeric (sem precision) |
| `completed_at` | `timestamptz NOT NULL DEFAULT now()` | `timestamptz null` | **Médio** — in-progress workouts | DROP NOT NULL, DROP DEFAULT |

### ✅ Alinhado
- `id`, `user_id`, `name`, `status`, `plan_id`, `plan_day_index`
- `duration_minutes`, `created_at`

### ✅ Indexes
- `workouts_user_completed_at` em `(user_id, completed_at desc)` — já existe

### ✅ RLS
- CRUD own-row policies — já existem (recriadas para garantir)

---

## 4. public.admin_audit_logs

### ⚠️ Divergências Críticas (afetam adminService.js)
| Coluna | Atual | Esperado | Risco | Ação |
|--------|-------|----------|-------|------|
| `actor_id` | `uuid NOT NULL` | `uuid null` | **Alto** — FK cascade | DROP NOT NULL, ALTER ON DELETE SET NULL |
| `action_detail` | `jsonb DEFAULT '{}'::jsonb` | `jsonb null` | **Médio** — código espera null | DROP DEFAULT, DROP NOT NULL |

### ✅ Alinhado
- `id`, `target_user_id`, `action_type`, `old_value`, `new_value`, `created_at`

### ✅ Indexes
- `admin_audit_logs_actor_idx` em `(actor_id, created_at desc)` — já existe
- `admin_audit_logs_target_idx` em `(target_user_id, created_at desc)` — já existe

### ✅ RLS
- admin-only SELECT — ✅
- admin-only INSERT (com actor_id = auth.uid()) — ✅

---

## 5. Extensões

| Extensão | Status |
|----------|--------|
| `pgcrypto` | ✅ CREATE EXTENSION IF NOT EXISTS |

---

## Resumo de Ações

### 🔴 Alta Prioridade
1. **admin_audit_logs.actor_id** — tornar nullable (impede erros quando admin é deletado)
2. **admin_audit_logs.action_detail** — tornar nullable (compatibilidade com adminService.js)

### 🟡 Média Prioridade  
3. **workouts.exercises_completed** — backfill + NOT NULL
4. **workouts.completed_at** — permitir null para workouts em progresso

### 🟢 Baixa Prioridade
5. **workout_plans.frequency** — remover NOT NULL/default
6. **workout_plans.start_date** — remover default
7. **profiles.updated_at** — adicionar coluna + trigger

---

## Arquivos Gerados

| Arquivo | Descrição |
|---------|-----------|
| `009_schema_alignment_diff.sql` | Migration idempotente com todos os ajustes |
| `009_schema_validation_tests.sql` | Testes pós-migration |
| `SCHEMA_DIFF_REPORT.md` | Este relatório |

---

## Validação Recomendada

Antes de rodar em produção:

```sql
-- 1. Backup (sempre)
-- 2. Rodar migration em staging
-- 3. Executar testes de validação
-- 4. Verificar logs de erro
```
