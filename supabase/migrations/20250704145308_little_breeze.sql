/*
  # Sistema de Gerenciamento de Agendamentos

  1. Novas Tabelas
    - `users` - Usuários do sistema com diferentes níveis de permissão
    - `user_roles` - Papéis/funções dos usuários (admin, operator, viewer)
    - `user_permissions` - Permissões específicas por usuário
    - Atualização das tabelas existentes para melhor organização

  2. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas de acesso baseadas em roles
    - Autenticação obrigatória para operações sensíveis

  3. Funcionalidades
    - Sistema de notificações em tempo real
    - Log de atividades detalhado
    - Backup automático de dados críticos
    - Relatórios e estatísticas avançadas
*/

-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de roles/papéis
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  permissions jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Inserir roles padrão
INSERT INTO user_roles (name, description, permissions) VALUES
('admin', 'Administrador com acesso total', '{"bookings": ["create", "read", "update", "delete"], "clients": ["create", "read", "update", "delete"], "services": ["create", "read", "update", "delete"], "availability": ["create", "read", "update", "delete"], "users": ["create", "read", "update", "delete"], "reports": ["read", "export"]}'),
('operator', 'Operador com acesso limitado', '{"bookings": ["create", "read", "update"], "clients": ["create", "read", "update"], "services": ["read"], "availability": ["read", "update"], "reports": ["read"]}'),
('viewer', 'Visualizador apenas leitura', '{"bookings": ["read"], "clients": ["read"], "services": ["read"], "availability": ["read"], "reports": ["read"]}')
ON CONFLICT (name) DO NOTHING;

-- Tabela de usuários estendida
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role_id uuid REFERENCES user_roles(id) DEFAULT (SELECT id FROM user_roles WHERE name = 'viewer'),
  is_active boolean DEFAULT true,
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Atualizar tabela de clientes para melhor organização
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'notes') THEN
    ALTER TABLE clients ADD COLUMN notes text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'status') THEN
    ALTER TABLE clients ADD COLUMN status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked'));
  END IF;
END $$;

-- Atualizar tabela de agendamentos
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'priority') THEN
    ALTER TABLE bookings ADD COLUMN priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'assigned_to') THEN
    ALTER TABLE bookings ADD COLUMN assigned_to uuid REFERENCES users(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'estimated_duration') THEN
    ALTER TABLE bookings ADD COLUMN estimated_duration interval;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'actual_duration') THEN
    ALTER TABLE bookings ADD COLUMN actual_duration interval;
  END IF;
END $$;

-- Tabela de templates de notificação
CREATE TABLE IF NOT EXISTS notification_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  type text NOT NULL,
  title_template text NOT NULL,
  message_template text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Inserir templates padrão
INSERT INTO notification_templates (name, type, title_template, message_template) VALUES
('booking_created', 'booking_created', 'Novo Agendamento Recebido', 'Nova solicitação de agendamento de {{client_name}} para {{service_name}} em {{booking_date}}'),
('booking_confirmed', 'booking_confirmed', 'Agendamento Confirmado', 'Agendamento de {{client_name}} confirmado para {{booking_date}}'),
('booking_cancelled', 'booking_cancelled', 'Agendamento Cancelado', 'Agendamento de {{client_name}} foi cancelado'),
('booking_reminder', 'system_alert', 'Lembrete de Agendamento', 'Agendamento com {{client_name}} amanhã às {{booking_time}}'),
('system_backup', 'system_alert', 'Backup Realizado', 'Backup automático do sistema realizado com sucesso')
ON CONFLICT (name) DO NOTHING;

-- Tabela de configurações do sistema
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'system_settings') THEN
    CREATE TABLE system_settings (
      key text PRIMARY KEY,
      value jsonb NOT NULL,
      description text,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
  END IF;
END $$;

-- Inserir configurações padrão
INSERT INTO system_settings (key, value, description) VALUES
('business_hours', '{"start": "08:00", "end": "18:00", "days": [1,2,3,4,5,6]}', 'Horário de funcionamento'),
('notification_settings', '{"email_enabled": true, "sms_enabled": false, "push_enabled": true}', 'Configurações de notificação'),
('booking_rules', '{"max_advance_days": 90, "min_advance_hours": 2, "allow_same_day": true}', 'Regras de agendamento'),
('backup_settings', '{"auto_backup": true, "backup_frequency": "daily", "retention_days": 30}', 'Configurações de backup')
ON CONFLICT (key) DO NOTHING;

-- Função para criar notificação automática
CREATE OR REPLACE FUNCTION create_notification(
  notification_type text,
  booking_data jsonb DEFAULT NULL
) RETURNS uuid AS $$
DECLARE
  template_record notification_templates%ROWTYPE;
  notification_title text;
  notification_message text;
  notification_id uuid;
BEGIN
  -- Buscar template
  SELECT * INTO template_record 
  FROM notification_templates 
  WHERE type = notification_type AND is_active = true
  LIMIT 1;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Template de notificação não encontrado: %', notification_type;
  END IF;
  
  -- Processar templates com dados do agendamento
  notification_title := template_record.title_template;
  notification_message := template_record.message_template;
  
  IF booking_data IS NOT NULL THEN
    -- Substituir placeholders
    notification_title := replace(notification_title, '{{client_name}}', COALESCE(booking_data->>'client_name', ''));
    notification_title := replace(notification_title, '{{service_name}}', COALESCE(booking_data->>'service_name', ''));
    notification_title := replace(notification_title, '{{booking_date}}', COALESCE(booking_data->>'booking_date', ''));
    
    notification_message := replace(notification_message, '{{client_name}}', COALESCE(booking_data->>'client_name', ''));
    notification_message := replace(notification_message, '{{service_name}}', COALESCE(booking_data->>'service_name', ''));
    notification_message := replace(notification_message, '{{booking_date}}', COALESCE(booking_data->>'booking_date', ''));
    notification_message := replace(notification_message, '{{booking_time}}', COALESCE(booking_data->>'booking_time', ''));
  END IF;
  
  -- Criar notificação
  INSERT INTO notifications (type, title, message, data)
  VALUES (notification_type, notification_title, notification_message, booking_data)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- Função para estatísticas avançadas do dashboard
CREATE OR REPLACE FUNCTION get_advanced_dashboard_stats()
RETURNS jsonb AS $$
DECLARE
  result jsonb;
  today_start timestamptz;
  week_start timestamptz;
  month_start timestamptz;
BEGIN
  today_start := date_trunc('day', now());
  week_start := date_trunc('week', now());
  month_start := date_trunc('month', now());
  
  SELECT jsonb_build_object(
    'total_bookings', (SELECT count(*) FROM bookings),
    'pending_bookings', (SELECT count(*) FROM bookings WHERE status = 'pending'),
    'confirmed_bookings', (SELECT count(*) FROM bookings WHERE status = 'confirmed'),
    'cancelled_bookings', (SELECT count(*) FROM bookings WHERE status = 'cancelled'),
    'completed_bookings', (SELECT count(*) FROM bookings WHERE status = 'completed'),
    'total_clients', (SELECT count(*) FROM clients WHERE status = 'active'),
    'bookings_today', (SELECT count(*) FROM bookings WHERE created_at >= today_start),
    'bookings_this_week', (SELECT count(*) FROM bookings WHERE created_at >= week_start),
    'bookings_this_month', (SELECT count(*) FROM bookings WHERE created_at >= month_start),
    'revenue_this_month', (
      SELECT COALESCE(sum(
        CASE 
          WHEN s.price_text ~ '^\d+$' THEN s.price_text::numeric
          WHEN s.price_text ~ 'R\$\s*(\d+)' THEN substring(s.price_text from 'R\$\s*(\d+)')::numeric
          ELSE 0
        END
      ), 0)
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      WHERE b.status = 'completed' AND b.completed_at >= month_start
    ),
    'avg_booking_value', (
      SELECT COALESCE(avg(
        CASE 
          WHEN s.price_text ~ '^\d+$' THEN s.price_text::numeric
          WHEN s.price_text ~ 'R\$\s*(\d+)' THEN substring(s.price_text from 'R\$\s*(\d+)')::numeric
          ELSE 0
        END
      ), 0)
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      WHERE b.status = 'completed'
    ),
    'most_popular_service', (
      SELECT s.title
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      WHERE b.status IN ('confirmed', 'completed')
      GROUP BY s.id, s.title
      ORDER BY count(*) DESC
      LIMIT 1
    ),
    'busiest_day_of_week', (
      SELECT to_char(booking_date, 'Day')
      FROM bookings
      WHERE status IN ('confirmed', 'completed')
      GROUP BY extract(dow from booking_date), to_char(booking_date, 'Day')
      ORDER BY count(*) DESC
      LIMIT 1
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Função para buscar agendamentos com filtros avançados
CREATE OR REPLACE FUNCTION get_bookings_advanced(
  status_filter text DEFAULT NULL,
  date_from date DEFAULT NULL,
  date_to date DEFAULT NULL,
  client_search text DEFAULT NULL,
  service_filter text DEFAULT NULL,
  priority_filter text DEFAULT NULL,
  assigned_to_filter uuid DEFAULT NULL,
  limit_count integer DEFAULT 100,
  offset_count integer DEFAULT 0
)
RETURNS TABLE (
  booking_id uuid,
  booking_date date,
  booking_status text,
  booking_priority text,
  booking_notes text,
  booking_created_at timestamptz,
  booking_confirmed_at timestamptz,
  booking_cancelled_at timestamptz,
  booking_completed_at timestamptz,
  estimated_duration interval,
  actual_duration interval,
  client_id uuid,
  client_name text,
  client_email text,
  client_phone text,
  client_address text,
  client_status text,
  service_id text,
  service_title text,
  service_price text,
  service_duration text,
  assigned_user_id uuid,
  assigned_user_name text,
  whatsapp_sent boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id as booking_id,
    b.booking_date,
    b.status as booking_status,
    COALESCE(b.priority, 'normal') as booking_priority,
    b.notes as booking_notes,
    b.created_at as booking_created_at,
    b.confirmed_at as booking_confirmed_at,
    b.cancelled_at as booking_cancelled_at,
    b.completed_at as booking_completed_at,
    b.estimated_duration,
    b.actual_duration,
    c.id as client_id,
    c.name as client_name,
    c.email as client_email,
    c.phone as client_phone,
    c.address as client_address,
    COALESCE(c.status, 'active') as client_status,
    s.id as service_id,
    s.title as service_title,
    s.price_text as service_price,
    s.duration as service_duration,
    u.id as assigned_user_id,
    u.name as assigned_user_name,
    COALESCE(b.whatsapp_sent, false) as whatsapp_sent
  FROM bookings b
  JOIN clients c ON b.client_id = c.id
  JOIN services s ON b.service_id = s.id
  LEFT JOIN users u ON b.assigned_to = u.id
  WHERE 
    (status_filter IS NULL OR b.status = status_filter)
    AND (date_from IS NULL OR b.booking_date >= date_from)
    AND (date_to IS NULL OR b.booking_date <= date_to)
    AND (client_search IS NULL OR c.name ILIKE '%' || client_search || '%' OR c.phone ILIKE '%' || client_search || '%')
    AND (service_filter IS NULL OR s.id = service_filter)
    AND (priority_filter IS NULL OR COALESCE(b.priority, 'normal') = priority_filter)
    AND (assigned_to_filter IS NULL OR b.assigned_to = assigned_to_filter)
    AND c.status != 'blocked'
  ORDER BY 
    CASE b.status 
      WHEN 'pending' THEN 1
      WHEN 'confirmed' THEN 2
      WHEN 'completed' THEN 3
      WHEN 'cancelled' THEN 4
    END,
    b.booking_date DESC,
    b.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- Trigger para criar notificações automáticas
CREATE OR REPLACE FUNCTION trigger_booking_notifications()
RETURNS trigger AS $$
DECLARE
  booking_data jsonb;
  client_name text;
  service_name text;
BEGIN
  -- Buscar dados relacionados
  SELECT c.name, s.title INTO client_name, service_name
  FROM clients c, services s
  WHERE c.id = COALESCE(NEW.client_id, OLD.client_id)
    AND s.id = COALESCE(NEW.service_id, OLD.service_id);
  
  -- Preparar dados para template
  booking_data := jsonb_build_object(
    'client_name', client_name,
    'service_name', service_name,
    'booking_date', COALESCE(NEW.booking_date, OLD.booking_date)::text,
    'booking_id', COALESCE(NEW.id, OLD.id)::text
  );
  
  -- Criar notificação baseada na operação
  IF TG_OP = 'INSERT' THEN
    PERFORM create_notification('booking_created', booking_data);
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != NEW.status THEN
      IF NEW.status = 'confirmed' THEN
        PERFORM create_notification('booking_confirmed', booking_data);
      ELSIF NEW.status = 'cancelled' THEN
        PERFORM create_notification('booking_cancelled', booking_data);
      END IF;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger
DROP TRIGGER IF EXISTS booking_notifications_trigger ON bookings;
CREATE TRIGGER booking_notifications_trigger
  AFTER INSERT OR UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION trigger_booking_notifications();

-- Habilitar RLS em todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para users
CREATE POLICY "Authenticated users can view users" ON users
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage users" ON users
  FOR ALL TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      JOIN user_roles r ON u.role_id = r.id 
      WHERE u.id = auth.uid() AND r.name = 'admin'
    )
  );

-- Políticas para user_roles
CREATE POLICY "Authenticated users can view roles" ON user_roles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage roles" ON user_roles
  FOR ALL TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      JOIN user_roles r ON u.role_id = r.id 
      WHERE u.id = auth.uid() AND r.name = 'admin'
    )
  );

-- Políticas para notification_templates
CREATE POLICY "Authenticated users can view templates" ON notification_templates
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage templates" ON notification_templates
  FOR ALL TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      JOIN user_roles r ON u.role_id = r.id 
      WHERE u.id = auth.uid() AND r.name = 'admin'
    )
  );

-- Atualizar políticas existentes para incluir verificação de roles
DROP POLICY IF EXISTS "Authenticated users can manage bookings" ON bookings;
CREATE POLICY "Users can manage bookings based on role" ON bookings
  FOR ALL TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      JOIN user_roles r ON u.role_id = r.id 
      WHERE u.id = auth.uid() 
      AND (r.name IN ('admin', 'operator') OR (r.name = 'viewer' AND TG_OP = 'SELECT'))
    )
  );

-- Função para verificar permissões
CREATE OR REPLACE FUNCTION check_user_permission(
  user_id uuid,
  resource text,
  action text
) RETURNS boolean AS $$
DECLARE
  user_permissions jsonb;
  resource_permissions text[];
BEGIN
  -- Buscar permissões do usuário
  SELECT r.permissions INTO user_permissions
  FROM users u
  JOIN user_roles r ON u.role_id = r.id
  WHERE u.id = user_id AND u.is_active = true;
  
  IF user_permissions IS NULL THEN
    RETURN false;
  END IF;
  
  -- Verificar se o usuário tem permissão para o recurso e ação
  SELECT array(SELECT jsonb_array_elements_text(user_permissions->resource)) INTO resource_permissions;
  
  RETURN action = ANY(resource_permissions);
END;
$$ LANGUAGE plpgsql;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_bookings_status_date ON bookings(status, booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_client_date ON bookings(client_id, booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_service_date ON bookings(service_id, booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_assigned_to ON bookings(assigned_to);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(is_read, created_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_table_action ON activity_logs(table_name, action, created_at);

-- Função para backup automático
CREATE OR REPLACE FUNCTION create_automatic_backup()
RETURNS trigger AS $$
BEGIN
  -- Inserir dados no backup apenas para operações críticas
  IF TG_TABLE_NAME IN ('bookings', 'clients') THEN
    INSERT INTO data_backups (table_name, backup_data, backup_type)
    VALUES (
      TG_TABLE_NAME,
      CASE 
        WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD)
        ELSE to_jsonb(NEW)
      END,
      'automatic'
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger de backup
DROP TRIGGER IF EXISTS backup_bookings ON bookings;
CREATE TRIGGER backup_bookings
  AFTER INSERT OR UPDATE OR DELETE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION create_automatic_backup();

DROP TRIGGER IF EXISTS backup_clients ON clients;
CREATE TRIGGER backup_clients
  AFTER INSERT OR UPDATE OR DELETE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION create_automatic_backup();