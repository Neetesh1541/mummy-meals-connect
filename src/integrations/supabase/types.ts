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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      cart: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          menu_id: string
          quantity: number
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          menu_id: string
          quantity: number
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          menu_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "cart_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_menu_id_fkey"
            columns: ["menu_id"]
            isOneToOne: false
            referencedRelation: "menu"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          order_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          order_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          order_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_partner_locations: {
        Row: {
          id: string
          latitude: number
          longitude: number
          partner_id: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          latitude: number
          longitude: number
          partner_id: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          latitude?: number
          longitude?: number
          partner_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_partner_locations_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          comment: string | null
          created_at: string
          customer_id: string
          id: string
          order_id: string
          rating: number
        }
        Insert: {
          comment?: string | null
          created_at?: string
          customer_id: string
          id?: string
          order_id: string
          rating: number
        }
        Update: {
          comment?: string | null
          created_at?: string
          customer_id?: string
          id?: string
          order_id?: string
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "feedback_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_customer_id"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      menu: {
        Row: {
          available: boolean | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_subscribable: boolean | null
          mom_id: string | null
          price: number | null
          title: string | null
        }
        Insert: {
          available?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_subscribable?: boolean | null
          mom_id?: string | null
          price?: number | null
          title?: string | null
        }
        Update: {
          available?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_subscribable?: boolean | null
          mom_id?: string | null
          price?: number | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_mom_id_fkey"
            columns: ["mom_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          customer_id: string | null
          customer_phone: string | null
          delivery_fee: number | null
          delivery_partner_id: string | null
          estimated_delivery_at: string | null
          id: string
          menu_id: string | null
          mom_id: string | null
          payment_method: string
          quantity: number | null
          shipping_details: Json | null
          status: string | null
          total_amount: number | null
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          customer_phone?: string | null
          delivery_fee?: number | null
          delivery_partner_id?: string | null
          estimated_delivery_at?: string | null
          id?: string
          menu_id?: string | null
          mom_id?: string | null
          payment_method?: string
          quantity?: number | null
          shipping_details?: Json | null
          status?: string | null
          total_amount?: number | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          customer_phone?: string | null
          delivery_fee?: number | null
          delivery_partner_id?: string | null
          estimated_delivery_at?: string | null
          id?: string
          menu_id?: string | null
          mom_id?: string | null
          payment_method?: string
          quantity?: number | null
          shipping_details?: Json | null
          status?: string | null
          total_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_delivery_partner_id_fkey"
            columns: ["delivery_partner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_menu_id_fkey"
            columns: ["menu_id"]
            isOneToOne: false
            referencedRelation: "menu"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_mom_id_fkey"
            columns: ["mom_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      password_failed_verification_attempts: {
        Row: {
          attempt_time: string | null
          id: number
          ip_address: string | null
          reason: string | null
          user_id: string
        }
        Insert: {
          attempt_time?: string | null
          id?: never
          ip_address?: string | null
          reason?: string | null
          user_id: string
        }
        Update: {
          attempt_time?: string | null
          id?: never
          ip_address?: string | null
          reason?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          bio: string | null
          created_at: string | null
          id: number
          user_id: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          id?: never
          user_id?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          id?: never
          user_id?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          customer_id: string
          delivery_day: string | null
          delivery_time: string | null
          end_date: string | null
          frequency: string
          id: string
          menu_id: string
          quantity: number
          shipping_details: Json | null
          start_date: string
          status: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          delivery_day?: string | null
          delivery_time?: string | null
          end_date?: string | null
          frequency: string
          id?: string
          menu_id: string
          quantity?: number
          shipping_details?: Json | null
          start_date: string
          status?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          delivery_day?: string | null
          delivery_time?: string | null
          end_date?: string | null
          frequency?: string
          id?: string
          menu_id?: string
          quantity?: number
          shipping_details?: Json | null
          start_date?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_menu_id_fkey"
            columns: ["menu_id"]
            isOneToOne: false
            referencedRelation: "menu"
            referencedColumns: ["id"]
          },
        ]
      }
      table_name: {
        Row: {
          data: Json | null
          id: number
          inserted_at: string
          name: string | null
          updated_at: string
        }
        Insert: {
          data?: Json | null
          id?: number
          inserted_at?: string
          name?: string | null
          updated_at?: string
        }
        Update: {
          data?: Json | null
          id?: number
          inserted_at?: string
          name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          address: Json | null
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          is_active: boolean | null
          phone: string | null
          user_type: string | null
        }
        Insert: {
          address?: Json | null
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          phone?: string | null
          user_type?: string | null
        }
        Update: {
          address?: Json | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          phone?: string | null
          user_type?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_delivery_order: { Args: { p_order_id: string }; Returns: Json }
      add_to_cart: {
        Args: {
          p_customer_id: string
          p_menu_item_id: string
          p_quantity: number
        }
        Returns: undefined
      }
      can_view_delivery_location: {
        Args: { p_partner_id: string }
        Returns: boolean
      }
      clear_cart: { Args: { user_id: string }; Returns: undefined }
      complete_delivery_order: { Args: { p_order_id: string }; Returns: Json }
      create_orders_from_cart:
        | { Args: { p_customer_id: string }; Returns: undefined }
        | {
            Args: {
              p_customer_id: string
              p_customer_phone: string
              p_shipping_details: Json
            }
            Returns: undefined
          }
        | {
            Args: {
              p_customer_id: string
              p_customer_phone: string
              p_payment_method?: string
              p_shipping_details: Json
            }
            Returns: undefined
          }
      custom_access_token_hook: { Args: { event: Json }; Returns: Json }
      get_cart_items: {
        Args: { user_id: string }
        Returns: {
          id: string
          menu: Json
          menu_id: string
          quantity: number
        }[]
      }
      get_menu_ratings: {
        Args: never
        Returns: {
          avg_rating: number
          menu_id_arg: string
          rating_count: number
        }[]
      }
      get_user_cart: {
        Args: { user_id: string }
        Returns: {
          id: string
          menu_id: string
          quantity: number
        }[]
      }
      has_role: { Args: { _role: string; _user_id: string }; Returns: boolean }
      is_part_of_order: {
        Args: { p_order_id: string; p_user_id: string }
        Returns: boolean
      }
      remove_from_cart: { Args: { cart_item_id: string }; Returns: undefined }
      submit_feedback: {
        Args: {
          p_comment_text?: string
          p_customer_id: string
          p_order_id: string
          p_rating_value: number
        }
        Returns: undefined
      }
      update_cart_quantity: {
        Args: { cart_item_id: string; new_quantity: number }
        Returns: undefined
      }
      update_delivery_partner_location: {
        Args: { p_latitude: number; p_longitude: number }
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
