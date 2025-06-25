export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      additional_options: {
        Row: {
          created_at: string | null
          id: string
          name: string
          price: number | null
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          price?: number | null
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          price?: number | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      admins: {
        Row: {
          created_at: string | null
          email: string
          id: string
          password_hash: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          password_hash: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          password_hash?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      foods: {
        Row: {
          additional_option_ids: string[] | null
          category_id: string | null
          created_at: string | null
          description: string | null
          id: string
          image_urls: Json | null
          is_available: boolean | null
          name: string
          price: number
          updated_at: string | null
        }
        Insert: {
          additional_option_ids?: string[] | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_urls?: Json | null
          is_available?: boolean | null
          name: string
          price: number
          updated_at?: string | null
        }
        Update: {
          additional_option_ids?: string[] | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_urls?: Json | null
          is_available?: boolean | null
          name?: string
          price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "foods_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          additional_notes: string | null
          addons: string[] | null
          created_at: string | null
          delivery_location: string
          delivery_time: string
          drink: string | null
          food_id: string | null
          id: string
          order_id: string
          order_status: string
          payment_mode: string
          payment_reference: string | null
          payment_status: string | null
          phone_number: string
          quantity: number
          updated_at: string | null
        }
        Insert: {
          additional_notes?: string | null
          addons?: string[] | null
          created_at?: string | null
          delivery_location: string
          delivery_time: string
          drink?: string | null
          food_id?: string | null
          id?: string
          order_id: string
          order_status?: string
          payment_mode: string
          payment_reference?: string | null
          payment_status?: string | null
          phone_number: string
          quantity: number
          updated_at?: string | null
        }
        Update: {
          additional_notes?: string | null
          addons?: string[] | null
          created_at?: string | null
          delivery_location?: string
          delivery_time?: string
          drink?: string | null
          food_id?: string | null
          id?: string
          order_id?: string
          order_status?: string
          payment_mode?: string
          payment_reference?: string | null
          payment_status?: string | null
          phone_number?: string
          quantity?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "foods"
            referencedColumns: ["id"]
          },
        ]
      }
      otp_tokens: {
        Row: {
          created_at: string | null
          email: string
          expires_at: string
          id: string
          otp: string
        }
        Insert: {
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          otp: string
        }
        Update: {
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          otp?: string
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      pending_otps: {
        Row: {
          created_at: string | null
          email: string
          expires_at: string
          id: string
          otp: string
        }
        Insert: {
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          otp: string
        }
        Update: {
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          otp?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          background_image_url: string | null
          contact_address: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          dark_mode_enabled: boolean | null
          email_settings: Json | null
          footer_text: string | null
          id: string
          notifications_enabled: boolean | null
          site_description: string | null
          site_name: string | null
          sms_settings: Json | null
          updated_at: string | null
        }
        Insert: {
          background_image_url?: string | null
          contact_address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          dark_mode_enabled?: boolean | null
          email_settings?: Json | null
          footer_text?: string | null
          id?: string
          notifications_enabled?: boolean | null
          site_description?: string | null
          site_name?: string | null
          sms_settings?: Json | null
          updated_at?: string | null
        }
        Update: {
          background_image_url?: string | null
          contact_address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          dark_mode_enabled?: boolean | null
          email_settings?: Json | null
          footer_text?: string | null
          id?: string
          notifications_enabled?: boolean | null
          site_description?: string | null
          site_name?: string | null
          sms_settings?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
