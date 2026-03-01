// lib/types/database.types.ts
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          name: string
          logo_url: string | null
          address: string | null
          phone: string | null
          tax_id: string | null
          stripe_customer_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          logo_url?: string | null
          address?: string | null
          phone?: string | null
          tax_id?: string | null
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          logo_url?: string | null
          address?: string | null
          phone?: string | null
          tax_id?: string | null
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          id: string
          company_id: string
          email: string
          name: string
          avatar_url: string | null
          role: Database["public"]["Enums"]["user_role"]
          department: string | null
          is_active: boolean
          email_confirmed: boolean
          last_login_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          company_id: string
          email: string
          name: string
          avatar_url?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          department?: string | null
          is_active?: boolean
          email_confirmed?: boolean
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          email?: string
          name?: string
          avatar_url?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          department?: string | null
          is_active?: boolean
          email_confirmed?: boolean
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          user_id: string
          onboarding_completed: boolean
          onboarding_step: number
          push_notifications_enabled: boolean
          email_notifications_enabled: boolean
          detection_completed_notifications: boolean
          limit_notifications: boolean
          payment_notifications: boolean
          news_notifications: boolean
          language: string
          timezone: string
          theme: string
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          onboarding_completed?: boolean
          onboarding_step?: number
          push_notifications_enabled?: boolean
          email_notifications_enabled?: boolean
          detection_completed_notifications?: boolean
          limit_notifications?: boolean
          payment_notifications?: boolean
          news_notifications?: boolean
          language?: string
          timezone?: string
          theme?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          onboarding_completed?: boolean
          onboarding_step?: number
          push_notifications_enabled?: boolean
          email_notifications_enabled?: boolean
          detection_completed_notifications?: boolean
          limit_notifications?: boolean
          payment_notifications?: boolean
          news_notifications?: boolean
          language?: string
          timezone?: string
          theme?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      site_tags: {
        Row: {
          id: string
          company_id: string
          name: string
          color: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          name: string
          color?: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          color?: string
          description?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_tags_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      detections: {
        Row: {
          id: string
          company_id: string
          user_id: string | null
          site_tag_id: string | null
          detection_number: number
          sample_name: string
          site_name: string
          result: boolean
          confidence: number
          ai_model_version: string | null
          detection_count: number
          processing_time_ms: number | null
          location: unknown | null
          address: string | null
          location_accuracy: number | null
          notes: string | null
          detection_date: string
          is_deleted: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          user_id?: string | null
          site_tag_id?: string | null
          detection_number?: number
          sample_name: string
          site_name: string
          result: boolean
          confidence: number
          ai_model_version?: string | null
          detection_count?: number
          processing_time_ms?: number | null
          location?: unknown | null
          address?: string | null
          location_accuracy?: number | null
          notes?: string | null
          detection_date?: string
          is_deleted?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          user_id?: string | null
          site_tag_id?: string | null
          detection_number?: number
          sample_name?: string
          site_name?: string
          result?: boolean
          confidence?: number
          ai_model_version?: string | null
          detection_count?: number
          processing_time_ms?: number | null
          location?: unknown | null
          address?: string | null
          location_accuracy?: number | null
          notes?: string | null
          detection_date?: string
          is_deleted?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "detections_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "detections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "detections_site_tag_id_fkey"
            columns: ["site_tag_id"]
            isOneToOne: false
            referencedRelation: "site_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      detection_images: {
        Row: {
          id: string
          detection_id: string
          original_url: string
          bb_url: string
          thumbnail_url: string | null
          filename: string | null
          order_index: number
          width: number | null
          height: number | null
          file_size: number | null
          mime_type: string | null
          created_at: string
        }
        Insert: {
          id?: string
          detection_id: string
          original_url: string
          bb_url: string
          thumbnail_url?: string | null
          filename?: string | null
          order_index?: number
          width?: number | null
          height?: number | null
          file_size?: number | null
          mime_type?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          detection_id?: string
          original_url?: string
          bb_url?: string
          thumbnail_url?: string | null
          filename?: string | null
          order_index?: number
          width?: number | null
          height?: number | null
          file_size?: number | null
          mime_type?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "detection_images_detection_id_fkey"
            columns: ["detection_id"]
            isOneToOne: false
            referencedRelation: "detections"
            referencedColumns: ["id"]
          },
        ]
      }
      bounding_boxes: {
        Row: {
          id: string
          detection_image_id: string
          x: number
          y: number
          width: number
          height: number
          confidence: number
          class_name: string
          created_at: string
        }
        Insert: {
          id?: string
          detection_image_id: string
          x: number
          y: number
          width: number
          height: number
          confidence: number
          class_name: string
          created_at?: string
        }
        Update: {
          id?: string
          detection_image_id?: string
          x?: number
          y?: number
          width?: number
          height?: number
          confidence?: number
          class_name?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bounding_boxes_detection_image_id_fkey"
            columns: ["detection_image_id"]
            isOneToOne: false
            referencedRelation: "detection_images"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          id: string
          company_id: string
          stripe_subscription_id: string | null
          stripe_price_id: string | null
          stripe_product_id: string | null
          plan_name: string
          status: Database["public"]["Enums"]["subscription_status"]
          current_period_start: string | null
          current_period_end: string | null
          trial_end: string | null
          cancel_at: string | null
          canceled_at: string | null
          monthly_limit: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          stripe_subscription_id?: string | null
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          plan_name: string
          status?: Database["public"]["Enums"]["subscription_status"]
          current_period_start?: string | null
          current_period_end?: string | null
          trial_end?: string | null
          cancel_at?: string | null
          canceled_at?: string | null
          monthly_limit: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          stripe_subscription_id?: string | null
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          plan_name?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          current_period_start?: string | null
          current_period_end?: string | null
          trial_end?: string | null
          cancel_at?: string | null
          canceled_at?: string | null
          monthly_limit?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          company_id: string
          type: Database["public"]["Enums"]["notification_type"]
          title: string
          message: string
          action_url: string | null
          is_read: boolean
          read_at: string | null
          priority: number
          created_at: string
          expires_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          company_id: string
          type: Database["public"]["Enums"]["notification_type"]
          title: string
          message: string
          action_url?: string | null
          is_read?: boolean
          read_at?: string | null
          priority?: number
          created_at?: string
          expires_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          company_id?: string
          type?: Database["public"]["Enums"]["notification_type"]
          title?: string
          message?: string
          action_url?: string | null
          is_read?: boolean
          read_at?: string | null
          priority?: number
          created_at?: string
          expires_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      labs: {
        Row: {
          id: string
          name: string
          logo_url: string | null
          description: string | null
          address: string
          location: unknown
          prefecture: string | null
          city: string | null
          phone: string | null
          email: string | null
          website_url: string | null
          delivery_days_min: number
          delivery_days_max: number
          price_min: number
          price_max: number | null
          service_area: string[]
          certifications: string[] | null
          track_record: number
          rating: number
          review_count: number
          is_active: boolean
          is_featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          logo_url?: string | null
          description?: string | null
          address: string
          location: unknown
          prefecture?: string | null
          city?: string | null
          phone?: string | null
          email?: string | null
          website_url?: string | null
          delivery_days_min: number
          delivery_days_max: number
          price_min: number
          price_max?: number | null
          service_area: string[]
          certifications?: string[] | null
          track_record?: number
          rating?: number
          review_count?: number
          is_active?: boolean
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          logo_url?: string | null
          description?: string | null
          address?: string
          location?: unknown
          prefecture?: string | null
          city?: string | null
          phone?: string | null
          email?: string | null
          website_url?: string | null
          delivery_days_min?: number
          delivery_days_max?: number
          price_min?: number
          price_max?: number | null
          service_area?: string[]
          certifications?: string[] | null
          track_record?: number
          rating?: number
          review_count?: number
          is_active?: boolean
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      monthly_usage_view: {
        Row: {
          company_id: string | null
          year_month: string | null
          detection_count: number | null
          monthly_limit: number | null
          usage_percentage: number | null
          subscription_status: Database["public"]["Enums"]["subscription_status"] | null
        }
      }
      detection_statistics_view: {
        Row: {
          company_id: string | null
          total_detections: number | null
          positive_count: number | null
          negative_count: number | null
          avg_confidence: number | null
          active_users: number | null
          unique_sites: number | null
          last_detection_at: string | null
        }
      }
    }
    Functions: {
      get_dashboard_stats: {
        Args: {
          p_company_id: string
          p_user_id?: string
          p_site_tag_id?: string
          p_start_date?: string
          p_end_date?: string
        }
        Returns: Json
      }
      get_current_usage: {
        Args: {
          p_company_id: string
        }
        Returns: Json
      }
      get_nearby_labs: {
        Args: {
          p_latitude: number
          p_longitude: number
          p_radius_km?: number
          p_limit?: number
        }
        Returns: {
          id: string
          name: string
          distance_km: number
          delivery_days_min: number
          delivery_days_max: number
          price_min: number
          rating: number
          phone: string | null
          website_url: string | null
        }[]
      }
      search_detections: {
        Args: {
          p_company_id: string
          p_query: string
          p_limit?: number
          p_offset?: number
        }
        Returns: {
          id: string
          sample_name: string
          site_name: string
          result: boolean
          confidence: number
          detection_date: string
          rank: number
        }[]
      }
    }
    Enums: {
      user_role: "owner" | "admin" | "member"
      subscription_status:
        | "trialing"
        | "active"
        | "past_due"
        | "canceled"
        | "unpaid"
        | "incomplete"
        | "incomplete_expired"
      invoice_status: "draft" | "open" | "paid" | "uncollectible" | "void"
      article_status: "draft" | "published" | "scheduled" | "archived"
      notification_type:
        | "limit_reached"
        | "limit_warning"
        | "payment_failed"
        | "payment_succeeded"
        | "card_expiring"
        | "detection_completed"
        | "member_added"
        | "member_removed"
        | "article_published"
        | "system_announcement"
      report_type: "false_positive" | "false_negative"
      referral_status: "pending" | "completed" | "expired" | "invalid"
    }
  }
}
