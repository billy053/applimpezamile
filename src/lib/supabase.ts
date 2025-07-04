import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set up your Supabase project.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Database types
export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string;
          name: string;
          email: string | null;
          phone: string;
          address: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email?: string | null;
          phone: string;
          address: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string | null;
          phone?: string;
          address?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      services: {
        Row: {
          id: string;
          title: string;
          description: string;
          price_text: string;
          duration: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          title: string;
          description: string;
          price_text: string;
          duration: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          price_text?: string;
          duration?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          client_id: string;
          service_id: string;
          booking_date: string;
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
          notes: string | null;
          created_at: string;
          updated_at: string;
          confirmed_at: string | null;
          cancelled_at: string | null;
          completed_at: string | null;
          whatsapp_sent: boolean;
        };
        Insert: {
          id?: string;
          client_id: string;
          service_id: string;
          booking_date: string;
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          confirmed_at?: string | null;
          cancelled_at?: string | null;
          completed_at?: string | null;
          whatsapp_sent?: boolean;
        };
        Update: {
          id?: string;
          client_id?: string;
          service_id?: string;
          booking_date?: string;
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          confirmed_at?: string | null;
          cancelled_at?: string | null;
          completed_at?: string | null;
          whatsapp_sent?: boolean;
        };
      };
      availability: {
        Row: {
          id: string;
          date: string;
          is_available: boolean;
          reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          date: string;
          is_available?: boolean;
          reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          is_available?: boolean;
          reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      activity_logs: {
        Row: {
          id: string;
          table_name: string;
          record_id: string;
          action: 'INSERT' | 'UPDATE' | 'DELETE';
          old_data: any | null;
          new_data: any | null;
          user_id: string | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          table_name: string;
          record_id: string;
          action: 'INSERT' | 'UPDATE' | 'DELETE';
          old_data?: any | null;
          new_data?: any | null;
          user_id?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          table_name?: string;
          record_id?: string;
          action?: 'INSERT' | 'UPDATE' | 'DELETE';
          old_data?: any | null;
          new_data?: any | null;
          user_id?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          type: 'booking_created' | 'booking_confirmed' | 'booking_cancelled' | 'system_alert';
          title: string;
          message: string;
          data: any | null;
          is_read: boolean;
          created_at: string;
          read_at: string | null;
        };
        Insert: {
          id?: string;
          type: 'booking_created' | 'booking_confirmed' | 'booking_cancelled' | 'system_alert';
          title: string;
          message: string;
          data?: any | null;
          is_read?: boolean;
          created_at?: string;
          read_at?: string | null;
        };
        Update: {
          id?: string;
          type?: 'booking_created' | 'booking_confirmed' | 'booking_cancelled' | 'system_alert';
          title?: string;
          message?: string;
          data?: any | null;
          is_read?: boolean;
          created_at?: string;
          read_at?: string | null;
        };
      };
      system_settings: {
        Row: {
          key: string;
          value: any;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          key: string;
          value: any;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          key?: string;
          value?: any;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Functions: {
      get_dashboard_stats: {
        Args: {};
        Returns: any;
      };
      get_bookings_with_details: {
        Args: {
          status_filter?: string;
          date_from?: string;
          date_to?: string;
          limit_count?: number;
        };
        Returns: Array<{
          booking_id: string;
          booking_date: string;
          booking_status: string;
          booking_notes: string | null;
          booking_created_at: string;
          booking_confirmed_at: string | null;
          client_id: string;
          client_name: string;
          client_email: string | null;
          client_phone: string;
          client_address: string;
          service_id: string;
          service_title: string;
          service_price: string;
          service_duration: string;
        }>;
      };
      check_date_availability: {
        Args: {
          check_date: string;
        };
        Returns: any;
      };
      create_booking_complete: {
        Args: {
          client_name: string;
          client_email?: string;
          client_phone: string;
          client_address: string;
          service_id: string;
          booking_date: string;
          booking_notes?: string;
        };
        Returns: any;
      };
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];