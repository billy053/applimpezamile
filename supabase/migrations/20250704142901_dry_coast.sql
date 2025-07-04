/*
  # Sistema de Agendamentos CleanPro - Schema Completo

  ## 1. Novas Tabelas
  - `clients` - Dados dos clientes
  - `services` - Tipos de serviços oferecidos
  - `bookings` - Agendamentos realizados
  - `availability` - Configurações de disponibilidade
  - `activity_logs` - Log de todas as operações
  - `notifications` - Sistema de notificações
  - `system_settings` - Configurações do sistema

  ## 2. Segurança
  - RLS habilitado em todas as tabelas
  - Políticas específicas para cada tipo de usuário
  - Controle de acesso baseado em autenticação

  ## 3. Funcionalidades
  - Histórico completo de operações
  - Sistema de backup automático via triggers
  - Controle de concorrência
  - Sincronização em tempo real
*/

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text NOT NULL,
  address text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT clients_phone_check CHECK (length(phone) >= 10),
  CONSTRAINT clients_name_check CHECK (length(name) >= 2)
);

-- Tabela de serviços
CREATE TABLE IF NOT EXISTS services (
  id text PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  price_text text NOT NULL,
  duration text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de agendamentos
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  service_id text REFERENCES services(id) ON DELETE RESTRICT,
  booking_date date NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  confirmed_at timestamptz,
  cancelled_at timestamptz,
  completed_at timestamptz,
  whatsapp_sent boolean DEFAULT false,
  
  -- Evitar agendamentos duplicados na mesma data
  CONSTRAINT unique_booking_per_date UNIQUE (booking_date, status) 
    DEFERRABLE INITIALLY DEFERRED
);

-- Tabela de disponibilidade
CREATE TABLE IF NOT EXISTS availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL UNIQUE,
  is_available boolean DEFAULT true,
  reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de logs de atividade
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  record_id text NOT NULL,
  action text NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data jsonb,
  new_data jsonb,
  user_id uuid REFERENCES auth.users(id),
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Tabela de notificações
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('booking_created', 'booking_confirmed', 'booking_cancelled', 'system_alert')),
  title text NOT NULL,
  message text NOT NULL,
  data jsonb,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  read_at timestamptz
);

-- Tabela de configurações do sistema
CREATE TABLE IF NOT EXISTS system_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de backups automáticos
CREATE TABLE IF NOT EXISTS data_backups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  backup_data jsonb NOT NULL,
  backup_type text DEFAULT 'automatic' CHECK (backup_type IN ('automatic', 'manual')),
  created_at timestamptz DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_client ON bookings(client_id);
CREATE INDEX IF NOT EXISTS idx_bookings_service ON bookings(service_id);
CREATE INDEX IF NOT EXISTS idx_availability_date ON availability(date);
CREATE INDEX IF NOT EXISTS idx_activity_logs_table_record ON activity_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_availability_updated_at BEFORE UPDATE ON availability
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para log de atividades
CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO activity_logs (
    table_name,
    record_id,
    action,
    old_data,
    new_data,
    user_id
  ) VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id::text, OLD.id::text),
    TG_OP,
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END,
    auth.uid()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Triggers para log de atividades
CREATE TRIGGER log_clients_activity AFTER INSERT OR UPDATE OR DELETE ON clients
  FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_bookings_activity AFTER INSERT OR UPDATE OR DELETE ON bookings
  FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_availability_activity AFTER INSERT OR UPDATE OR DELETE ON availability
  FOR EACH ROW EXECUTE FUNCTION log_activity();

-- Função para backup automático
CREATE OR REPLACE FUNCTION create_automatic_backup()
RETURNS TRIGGER AS $$
BEGIN
  -- Backup de agendamentos importantes
  IF TG_TABLE_NAME = 'bookings' AND (TG_OP = 'UPDATE' OR TG_OP = 'DELETE') THEN
    INSERT INTO data_backups (table_name, backup_data)
    VALUES (TG_TABLE_NAME, to_jsonb(OLD));
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Trigger para backup automático
CREATE TRIGGER backup_bookings AFTER UPDATE OR DELETE ON bookings
  FOR EACH ROW EXECUTE FUNCTION create_automatic_backup();

-- Função para atualizar timestamps de status
CREATE OR REPLACE FUNCTION update_booking_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar timestamp quando status muda
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    CASE NEW.status
      WHEN 'confirmed' THEN NEW.confirmed_at = now();
      WHEN 'cancelled' THEN NEW.cancelled_at = now();
      WHEN 'completed' THEN NEW.completed_at = now();
      ELSE NULL;
    END CASE;
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para timestamps de status
CREATE TRIGGER update_booking_status_timestamps BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_booking_timestamps();

-- Inserir serviços padrão
INSERT INTO services (id, title, description, price_text, duration) VALUES
  ('residencial', 'Limpeza Residencial', 'Limpeza completa de casas e apartamentos', 'R$ 120', '3-4 horas'),
  ('comercial', 'Limpeza Comercial', 'Limpeza de escritórios e estabelecimentos comerciais', 'R$ 180', '4-6 horas'),
  ('predial', 'Limpeza Predial', 'Limpeza de condomínios e áreas comuns', 'R$ 250', '6-8 horas')
ON CONFLICT (id) DO NOTHING;

-- Inserir configurações padrão do sistema
INSERT INTO system_settings (key, value, description) VALUES
  ('whatsapp_number', '"555381556144"', 'Número do WhatsApp para contato'),
  ('business_hours', '{"start": "08:00", "end": "18:00"}', 'Horário de funcionamento'),
  ('max_bookings_per_day', '3', 'Máximo de agendamentos por dia'),
  ('advance_booking_days', '30', 'Dias de antecedência para agendamento'),
  ('auto_backup_enabled', 'true', 'Backup automático habilitado'),
  ('notification_settings', '{"email": true, "whatsapp": true, "push": false}', 'Configurações de notificação')
ON CONFLICT (key) DO NOTHING;

-- Habilitar RLS em todas as tabelas
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_backups ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para acesso público (leitura limitada)
CREATE POLICY "Public can view active services" ON services
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view availability" ON availability
  FOR SELECT USING (true);

-- Políticas RLS para usuários autenticados (acesso completo)
CREATE POLICY "Authenticated users can manage clients" ON clients
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage services" ON services
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage bookings" ON bookings
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage availability" ON availability
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can view activity logs" ON activity_logs
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage notifications" ON notifications
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage system settings" ON system_settings
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can view backups" ON data_backups
  FOR SELECT TO authenticated USING (true);

-- Políticas para inserção pública (agendamentos)
CREATE POLICY "Anyone can create bookings" ON bookings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can create clients" ON clients
  FOR INSERT WITH CHECK (true);

-- Função para estatísticas do dashboard
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS jsonb AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_bookings', (SELECT count(*) FROM bookings),
    'pending_bookings', (SELECT count(*) FROM bookings WHERE status = 'pending'),
    'confirmed_bookings', (SELECT count(*) FROM bookings WHERE status = 'confirmed'),
    'cancelled_bookings', (SELECT count(*) FROM bookings WHERE status = 'cancelled'),
    'completed_bookings', (SELECT count(*) FROM bookings WHERE status = 'completed'),
    'total_clients', (SELECT count(*) FROM clients),
    'bookings_today', (SELECT count(*) FROM bookings WHERE booking_date = CURRENT_DATE),
    'bookings_this_week', (
      SELECT count(*) FROM bookings 
      WHERE booking_date >= date_trunc('week', CURRENT_DATE)
      AND booking_date < date_trunc('week', CURRENT_DATE) + interval '1 week'
    ),
    'bookings_this_month', (
      SELECT count(*) FROM bookings 
      WHERE booking_date >= date_trunc('month', CURRENT_DATE)
      AND booking_date < date_trunc('month', CURRENT_DATE) + interval '1 month'
    )
  ) INTO result;
  
  RETURN result;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Função para obter agendamentos com detalhes completos
CREATE OR REPLACE FUNCTION get_bookings_with_details(
  status_filter text DEFAULT NULL,
  date_from date DEFAULT NULL,
  date_to date DEFAULT NULL,
  limit_count int DEFAULT 100
)
RETURNS TABLE (
  booking_id uuid,
  booking_date date,
  booking_status text,
  booking_notes text,
  booking_created_at timestamptz,
  booking_confirmed_at timestamptz,
  client_id uuid,
  client_name text,
  client_email text,
  client_phone text,
  client_address text,
  service_id text,
  service_title text,
  service_price text,
  service_duration text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.booking_date,
    b.status,
    b.notes,
    b.created_at,
    b.confirmed_at,
    c.id,
    c.name,
    c.email,
    c.phone,
    c.address,
    s.id,
    s.title,
    s.price_text,
    s.duration
  FROM bookings b
  JOIN clients c ON b.client_id = c.id
  JOIN services s ON b.service_id = s.id
  WHERE 
    (status_filter IS NULL OR b.status = status_filter)
    AND (date_from IS NULL OR b.booking_date >= date_from)
    AND (date_to IS NULL OR b.booking_date <= date_to)
  ORDER BY b.booking_date DESC, b.created_at DESC
  LIMIT limit_count;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Função para verificar disponibilidade de data
CREATE OR REPLACE FUNCTION check_date_availability(check_date date)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
  is_available boolean := true;
  reason text := NULL;
  existing_booking_count int;
  max_bookings int;
BEGIN
  -- Verificar se é data passada
  IF check_date < CURRENT_DATE THEN
    is_available := false;
    reason := 'Data no passado';
  END IF;
  
  -- Verificar configuração de disponibilidade
  SELECT a.is_available, a.reason INTO is_available, reason
  FROM availability a
  WHERE a.date = check_date;
  
  -- Se não há configuração específica, verificar regras padrão
  IF NOT FOUND THEN
    -- Verificar se é domingo (padrão: indisponível)
    IF EXTRACT(DOW FROM check_date) = 0 THEN
      is_available := false;
      reason := 'Não trabalhamos aos domingos';
    END IF;
  END IF;
  
  -- Verificar limite de agendamentos por dia
  SELECT count(*) INTO existing_booking_count
  FROM bookings
  WHERE booking_date = check_date AND status IN ('confirmed', 'pending');
  
  SELECT value::int INTO max_bookings
  FROM system_settings
  WHERE key = 'max_bookings_per_day';
  
  IF existing_booking_count >= COALESCE(max_bookings, 3) THEN
    is_available := false;
    reason := 'Limite de agendamentos atingido para esta data';
  END IF;
  
  SELECT jsonb_build_object(
    'date', check_date,
    'is_available', is_available,
    'reason', reason,
    'existing_bookings', existing_booking_count,
    'max_bookings', COALESCE(max_bookings, 3)
  ) INTO result;
  
  RETURN result;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Função para criar agendamento completo
CREATE OR REPLACE FUNCTION create_booking_complete(
  client_name text,
  client_email text,
  client_phone text,
  client_address text,
  service_id text,
  booking_date date,
  booking_notes text DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  client_id uuid;
  booking_id uuid;
  availability_check jsonb;
  result jsonb;
BEGIN
  -- Verificar disponibilidade
  SELECT check_date_availability(booking_date) INTO availability_check;
  
  IF NOT (availability_check->>'is_available')::boolean THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Data não disponível',
      'reason', availability_check->>'reason'
    );
  END IF;
  
  -- Criar ou encontrar cliente
  INSERT INTO clients (name, email, phone, address)
  VALUES (client_name, client_email, client_phone, client_address)
  ON CONFLICT (phone) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    address = EXCLUDED.address,
    updated_at = now()
  RETURNING id INTO client_id;
  
  -- Criar agendamento
  INSERT INTO bookings (client_id, service_id, booking_date, notes)
  VALUES (client_id, service_id, booking_date, booking_notes)
  RETURNING id INTO booking_id;
  
  -- Criar notificação
  INSERT INTO notifications (type, title, message, data)
  VALUES (
    'booking_created',
    'Novo agendamento criado',
    'Um novo agendamento foi solicitado para ' || booking_date::text,
    jsonb_build_object('booking_id', booking_id, 'client_id', client_id)
  );
  
  SELECT jsonb_build_object(
    'success', true,
    'booking_id', booking_id,
    'client_id', client_id,
    'message', 'Agendamento criado com sucesso'
  ) INTO result;
  
  RETURN result;
END;
$$ language 'plpgsql' SECURITY DEFINER;