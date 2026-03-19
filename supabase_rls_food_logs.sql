-- ============================================================
-- Atlas Core — Supabase RLS para a tabela food_logs
-- Execute no SQL Editor do painel Supabase:
-- https://supabase.com/dashboard/project/<seu-projeto>/sql/new
-- ============================================================

-- 1. Habilitar RLS na tabela (caso ainda não esteja habilitado)
ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;

-- 2. Remover políticas antigas conflitantes (se existirem)
DROP POLICY IF EXISTS "food_logs_select_own" ON food_logs;
DROP POLICY IF EXISTS "food_logs_insert_own" ON food_logs;
DROP POLICY IF EXISTS "food_logs_update_own" ON food_logs;
DROP POLICY IF EXISTS "food_logs_delete_own" ON food_logs;

-- 3. SELECT: cada usuário autenticado vê apenas seus próprios registros
CREATE POLICY "food_logs_select_own"
  ON food_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 4. INSERT: cada usuário autenticado pode inserir somente com seu próprio user_id
CREATE POLICY "food_logs_insert_own"
  ON food_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 5. UPDATE: cada usuário atualiza somente seus próprios registros
CREATE POLICY "food_logs_update_own"
  ON food_logs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 6. DELETE: cada usuário deleta somente seus próprios registros
CREATE POLICY "food_logs_delete_own"
  ON food_logs
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================
-- Verificação: listar políticas ativas na tabela
-- ============================================================
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'food_logs'
ORDER BY policyname;
