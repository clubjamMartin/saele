export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          check_in: string | null
          check_out: string | null
          created_at: string
          email: string
          external_booking_id: string
          guest_count: number | null
          guest_user_id: string | null
          id: string
          room_name: string | null
          status: string
        }
        Insert: {
          check_in?: string | null
          check_out?: string | null
          created_at?: string
          email: string
          external_booking_id: string
          guest_count?: number | null
          guest_user_id?: string | null
          id?: string
          room_name?: string | null
          status?: string
        }
        Update: {
          check_in?: string | null
          check_out?: string | null
          created_at?: string
          email?: string
          external_booking_id?: string
          guest_count?: number | null
          guest_user_id?: string | null
          id?: string
          room_name?: string | null
          status?: string
        }
        Relationships: []
      }
      event_logs: {
        Row: {
          booking_id: string | null
          created_at: string
          event_type: string
          external_id: string | null
          id: string
          level: string
          message: string
          meta: Json
          request_id: string | null
          user_id: string | null
        }
        Insert: {
          booking_id?: string | null
          created_at?: string
          event_type: string
          external_id?: string | null
          id?: string
          level?: string
          message: string
          meta?: Json
          request_id?: string | null
          user_id?: string | null
        }
        Update: {
          booking_id?: string | null
          created_at?: string
          event_type?: string
          external_id?: string | null
          id?: string
          level?: string
          message?: string
          meta?: Json
          request_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_logs_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      host_contacts: {
        Row: {
          created_at: string
          display_name: string
          email: string | null
          id: string
          is_active: boolean
          phone: string | null
          whatsapp: string | null
        }
        Insert: {
          created_at?: string
          display_name: string
          email?: string | null
          id?: string
          is_active?: boolean
          phone?: string | null
          whatsapp?: string | null
        }
        Update: {
          created_at?: string
          display_name?: string
          email?: string | null
          id?: string
          is_active?: boolean
          phone?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      notification_event_logs: {
        Row: {
          attempt_number: number
          created_at: string
          error_code: string | null
          error_message: string | null
          event_type: string
          id: string
          notification_id: string
          resend_email_id: string | null
          response_metadata: Json
        }
        Insert: {
          attempt_number?: number
          created_at?: string
          error_code?: string | null
          error_message?: string | null
          event_type: string
          id?: string
          notification_id: string
          resend_email_id?: string | null
          response_metadata?: Json
        }
        Update: {
          attempt_number?: number
          created_at?: string
          error_code?: string | null
          error_message?: string | null
          event_type?: string
          id?: string
          notification_id?: string
          resend_email_id?: string | null
          response_metadata?: Json
        }
        Relationships: [
          {
            foreignKeyName: "notification_event_logs_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "failed_notifications_report"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_event_logs_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notification_processing_timeline"
            referencedColumns: ["notification_id"]
          },
          {
            foreignKeyName: "notification_event_logs_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          attempts: number
          booking_id: string | null
          created_at: string
          id: string
          last_error: string | null
          next_retry_at: string | null
          payload: Json
          recipient_email: string
          sent_at: string | null
          status: string
          type: string
          user_id: string | null
        }
        Insert: {
          attempts?: number
          booking_id?: string | null
          created_at?: string
          id?: string
          last_error?: string | null
          next_retry_at?: string | null
          payload?: Json
          recipient_email: string
          sent_at?: string | null
          status?: string
          type: string
          user_id?: string | null
        }
        Update: {
          attempts?: number
          booking_id?: string | null
          created_at?: string
          id?: string
          last_error?: string | null
          next_retry_at?: string | null
          payload?: Json
          recipient_email?: string
          sent_at?: string | null
          status?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          interests: string[] | null
          notification_preferences: Json | null
          onboarding_completed_at: string | null
          phone: string | null
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          interests?: string[] | null
          notification_preferences?: Json | null
          onboarding_completed_at?: string | null
          phone?: string | null
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          interests?: string[] | null
          notification_preferences?: Json | null
          onboarding_completed_at?: string | null
          phone?: string | null
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      failed_notifications_report: {
        Row: {
          attempts: number | null
          created_at: string | null
          event_count: number | null
          id: string | null
          last_error: string | null
          latest_error_code: string | null
          latest_error_message: string | null
          recipient_email: string | null
          sent_at: string | null
          type: string | null
        }
        Insert: {
          attempts?: number | null
          created_at?: string | null
          event_count?: never
          id?: string | null
          last_error?: string | null
          latest_error_code?: never
          latest_error_message?: never
          recipient_email?: string | null
          sent_at?: string | null
          type?: string | null
        }
        Update: {
          attempts?: number | null
          created_at?: string | null
          event_count?: never
          id?: string | null
          last_error?: string | null
          latest_error_code?: never
          latest_error_message?: never
          recipient_email?: string | null
          sent_at?: string | null
          type?: string | null
        }
        Relationships: []
      }
      notification_error_summary: {
        Row: {
          affected_notifications: number | null
          affected_types: string[] | null
          error_code: string | null
          first_occurrence: string | null
          last_occurrence: string | null
          occurrence_count: number | null
          sample_error_message: string | null
        }
        Relationships: []
      }
      notification_processing_timeline: {
        Row: {
          attempt_number: number | null
          current_status: string | null
          error_code: string | null
          error_message: string | null
          event_created_at: string | null
          event_id: string | null
          event_type: string | null
          notification_created_at: string | null
          notification_id: string | null
          notification_sent_at: string | null
          notification_type: string | null
          previous_event_time: string | null
          recipient_email: string | null
          resend_email_id: string | null
          response_metadata: Json | null
          seconds_since_previous_event: number | null
          total_attempts: number | null
        }
        Relationships: []
      }
      notification_queue_status: {
        Row: {
          avg_processing_time_seconds_24h: number | null
          never_attempted: number | null
          queued_last_hour: number | null
          ready_to_process: number | null
          retry_1: number | null
          retry_2: number | null
          total_failed: number | null
          total_sent: number | null
          waiting_for_retry: number | null
        }
        Relationships: []
      }
      notifications_dashboard_view: {
        Row: {
          avg_attempts: number | null
          count_last_24h: number | null
          count_last_hour: number | null
          newest_created: string | null
          oldest_created: string | null
          retried_count: number | null
          status: string | null
          total_count: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_next_retry: { Args: { attempt_count: number }; Returns: string }
      get_queued_notifications: {
        Args: { p_limit?: number }
        Returns: {
          attempts: number
          booking_id: string
          created_at: string
          id: string
          last_error: string
          payload: Json
          recipient_email: string
          type: string
          user_id: string
        }[]
      }
      is_admin: { Args: never; Returns: boolean }
      log_notification_event: {
        Args: {
          p_attempt_number?: number
          p_event_type: string
          p_metadata?: Json
          p_notification_id: string
        }
        Returns: undefined
      }
      queue_notification: {
        Args: {
          p_booking_id?: string
          p_payload?: Json
          p_recipient_email: string
          p_type: string
          p_user_id?: string
        }
        Returns: string
      }
      update_notification_status: {
        Args: {
          p_error_code?: string
          p_error_message?: string
          p_notification_id: string
          p_resend_email_id?: string
          p_response_metadata?: Json
          p_status: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
