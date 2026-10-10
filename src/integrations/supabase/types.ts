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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          address_line1: string
          address_line2: string | null
          city: string
          company: string | null
          country: string
          created_at: string
          first_name: string | null
          id: string
          is_default: boolean
          label: string | null
          last_name: string | null
          phone: string | null
          postal_code: string
          type: Database["public"]["Enums"]["address_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          city: string
          company?: string | null
          country?: string
          created_at?: string
          first_name?: string | null
          id?: string
          is_default?: boolean
          label?: string | null
          last_name?: string | null
          phone?: string | null
          postal_code: string
          type: Database["public"]["Enums"]["address_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          city?: string
          company?: string | null
          country?: string
          created_at?: string
          first_name?: string | null
          id?: string
          is_default?: boolean
          label?: string | null
          last_name?: string | null
          phone?: string | null
          postal_code?: string
          type?: Database["public"]["Enums"]["address_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      avis: {
        Row: {
          author_name: string
          content: string
          created_at: string
          helpful_count: number
          id: string
          order_id: string | null
          photos: Json | null
          product_handle: string | null
          rating: number
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["avis_status"]
          user_id: string | null
          verified: boolean
        }
        Insert: {
          author_name: string
          content: string
          created_at?: string
          helpful_count?: number
          id?: string
          order_id?: string | null
          photos?: Json | null
          product_handle?: string | null
          rating: number
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["avis_status"]
          user_id?: string | null
          verified?: boolean
        }
        Update: {
          author_name?: string
          content?: string
          created_at?: string
          helpful_count?: number
          id?: string
          order_id?: string | null
          photos?: Json | null
          product_handle?: string | null
          rating?: number
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["avis_status"]
          user_id?: string | null
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "avis_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_items: {
        Row: {
          cart_id: string
          created_at: string
          currency: string | null
          customization: Json | null
          id: string
          product_id: string | null
          quantity: number
          saved_design_id: string | null
          unit_price: number | null
          updated_at: string
        }
        Insert: {
          cart_id: string
          created_at?: string
          currency?: string | null
          customization?: Json | null
          id?: string
          product_id?: string | null
          quantity?: number
          saved_design_id?: string | null
          unit_price?: number | null
          updated_at?: string
        }
        Update: {
          cart_id?: string
          created_at?: string
          currency?: string | null
          customization?: Json | null
          id?: string
          product_id?: string | null
          quantity?: number
          saved_design_id?: string | null
          unit_price?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_saved_design_id_fkey"
            columns: ["saved_design_id"]
            isOneToOne: false
            referencedRelation: "saved_designs"
            referencedColumns: ["id"]
          },
        ]
      }
      carts: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          session_id: string | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          session_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          session_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      catalogue_animaux: {
        Row: {
          active: boolean
          bucket_name: string | null
          categorie: string | null
          created_at: string
          description: string | null
          espece: string
          id: number
          image_index: number | null
          image_name: string | null
          nom: string
          photo_url: string | null
          product_handle: string | null
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean
          bucket_name?: string | null
          categorie?: string | null
          created_at?: string
          description?: string | null
          espece: string
          id?: number
          image_index?: number | null
          image_name?: string | null
          nom: string
          photo_url?: string | null
          product_handle?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean
          bucket_name?: string | null
          categorie?: string | null
          created_at?: string
          description?: string | null
          espece?: string
          id?: number
          image_index?: number | null
          image_name?: string | null
          nom?: string
          photo_url?: string | null
          product_handle?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      catalogue_drapeaux: {
        Row: {
          active: boolean
          code_iso: string | null
          code_pays: string | null
          created_at: string
          id: number
          image_index: number | null
          image_name: string | null
          pays: string
          photo_url: string | null
          product_handle: string | null
          region: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean
          code_iso?: string | null
          code_pays?: string | null
          created_at?: string
          id?: number
          image_index?: number | null
          image_name?: string | null
          pays: string
          photo_url?: string | null
          product_handle?: string | null
          region?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean
          code_iso?: string | null
          code_pays?: string | null
          created_at?: string
          id?: number
          image_index?: number | null
          image_name?: string | null
          pays?: string
          photo_url?: string | null
          product_handle?: string | null
          region?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          read: boolean
          subject: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          read?: boolean
          subject?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          read?: boolean
          subject?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      coupons_used: {
        Row: {
          coupon_code: string
          created_at: string
          discount_amount: number
          id: string
          order_id: string | null
          user_id: string
        }
        Insert: {
          coupon_code: string
          created_at?: string
          discount_amount?: number
          id?: string
          order_id?: string | null
          user_id: string
        }
        Update: {
          coupon_code?: string
          created_at?: string
          discount_amount?: number
          id?: string
          order_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupons_used_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_orders: {
        Row: {
          created_at: string
          currency: string
          email: string
          id: string
          note: string | null
          photo_url: string | null
          prenom: string | null
          product_family: string | null
          product_handle: string | null
          quantity: number
          shopify_order_id: string | null
          status: Database["public"]["Enums"]["order_status"]
          unit_price_cts: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          currency?: string
          email: string
          id?: string
          note?: string | null
          photo_url?: string | null
          prenom?: string | null
          product_family?: string | null
          product_handle?: string | null
          quantity?: number
          shopify_order_id?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          unit_price_cts?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          currency?: string
          email?: string
          id?: string
          note?: string | null
          photo_url?: string | null
          prenom?: string | null
          product_family?: string | null
          product_handle?: string | null
          quantity?: number
          shopify_order_id?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          unit_price_cts?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      family_photos: {
        Row: {
          family_id: string
          photo_url: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          family_id: string
          photo_url?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          family_id?: string
          photo_url?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          product_id: string
          saved_design_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          saved_design_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          saved_design_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_saved_design_id_fkey"
            columns: ["saved_design_id"]
            isOneToOne: false
            referencedRelation: "saved_designs"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          invoice_number: string
          order_id: string
          pdf_url: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          invoice_number: string
          order_id: string
          pdf_url?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          invoice_number?: string
          order_id?: string
          pdf_url?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      login_history: {
        Row: {
          created_at: string
          id: string
          ip_address: string | null
          location: string | null
          succeeded: boolean
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address?: string | null
          location?: string | null
          succeeded?: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: string | null
          location?: string | null
          succeeded?: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      loyalty_points: {
        Row: {
          action: string
          balance: number
          created_at: string
          description: string | null
          id: string
          order_id: string | null
          points: number
          user_id: string
        }
        Insert: {
          action: string
          balance?: number
          created_at?: string
          description?: string | null
          id?: string
          order_id?: string | null
          points: number
          user_id: string
        }
        Update: {
          action?: string
          balance?: number
          created_at?: string
          description?: string | null
          id?: string
          order_id?: string | null
          points?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_points_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      magnet_projects: {
        Row: {
          created_at: string | null
          crop_data: Json | null
          cropped_image_url: string | null
          customer_session: string | null
          flip_x: boolean | null
          flip_y: boolean | null
          height: number | null
          id: string
          image_url: string | null
          quantity: number | null
          rotation: number | null
          shape: string
          status: string | null
          total_price: number | null
          width: number | null
          zoom: number | null
        }
        Insert: {
          created_at?: string | null
          crop_data?: Json | null
          cropped_image_url?: string | null
          customer_session?: string | null
          flip_x?: boolean | null
          flip_y?: boolean | null
          height?: number | null
          id?: string
          image_url?: string | null
          quantity?: number | null
          rotation?: number | null
          shape: string
          status?: string | null
          total_price?: number | null
          width?: number | null
          zoom?: number | null
        }
        Update: {
          created_at?: string | null
          crop_data?: Json | null
          cropped_image_url?: string | null
          customer_session?: string | null
          flip_x?: boolean | null
          flip_y?: boolean | null
          height?: number | null
          id?: string
          image_url?: string | null
          quantity?: number | null
          rotation?: number | null
          shape?: string
          status?: string | null
          total_price?: number | null
          width?: number | null
          zoom?: number | null
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          confirmed: boolean
          confirmed_at: string | null
          email: string
          id: string
          subscribed_at: string
          token: string | null
          unsubscribed_at: string | null
        }
        Insert: {
          confirmed?: boolean
          confirmed_at?: string | null
          email: string
          id?: string
          subscribed_at?: string
          token?: string | null
          unsubscribed_at?: string | null
        }
        Update: {
          confirmed?: boolean
          confirmed_at?: string | null
          email?: string
          id?: string
          subscribed_at?: string
          token?: string | null
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          link: string | null
          message: string | null
          read: boolean
          read_at: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          link?: string | null
          message?: string | null
          read?: boolean
          read_at?: string | null
          title: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          link?: string | null
          message?: string | null
          read?: boolean
          read_at?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          customization: Json | null
          discount_amount: number | null
          fulfilled_quantity: number
          id: string
          metadata: Json | null
          order_id: string
          product_id: string
          product_image_url: string | null
          product_name: string
          quantity: number
          tax_rate: number | null
          total_price: number | null
          unit_price: number
        }
        Insert: {
          customization?: Json | null
          discount_amount?: number | null
          fulfilled_quantity?: number
          id?: string
          metadata?: Json | null
          order_id: string
          product_id: string
          product_image_url?: string | null
          product_name: string
          quantity: number
          tax_rate?: number | null
          total_price?: number | null
          unit_price: number
        }
        Update: {
          customization?: Json | null
          discount_amount?: number | null
          fulfilled_quantity?: number
          id?: string
          metadata?: Json | null
          order_id?: string
          product_id?: string
          product_image_url?: string | null
          product_name?: string
          quantity?: number
          tax_rate?: number | null
          total_price?: number | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          amount_total: number
          billing_address: Json | null
          billing_address_id: string | null
          cancelled_at: string | null
          created_at: string | null
          currency: string
          customer_name: string | null
          delivered_at: string | null
          email: string | null
          estimated_delivery_at: string | null
          id: string
          metadata: Json | null
          notes: string | null
          order_number: string | null
          shipped_at: string | null
          shipping_address: Json | null
          shipping_address_id: string | null
          shipping_carrier: string | null
          status: string
          stripe_checkout_session_id: string | null
          stripe_customer_id: string | null
          tracking_number: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount_total: number
          billing_address?: Json | null
          billing_address_id?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          currency?: string
          customer_name?: string | null
          delivered_at?: string | null
          email?: string | null
          estimated_delivery_at?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          order_number?: string | null
          shipped_at?: string | null
          shipping_address?: Json | null
          shipping_address_id?: string | null
          shipping_carrier?: string | null
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_customer_id?: string | null
          tracking_number?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount_total?: number
          billing_address?: Json | null
          billing_address_id?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          currency?: string
          customer_name?: string | null
          delivered_at?: string | null
          email?: string | null
          estimated_delivery_at?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          order_number?: string | null
          shipped_at?: string | null
          shipping_address?: Json | null
          shipping_address_id?: string | null
          shipping_carrier?: string | null
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_customer_id?: string | null
          tracking_number?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_billing_address_id_fkey"
            columns: ["billing_address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_shipping_address_id_fkey"
            columns: ["shipping_address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          currency: string
          failure_code: string | null
          failure_message: string | null
          id: string
          invoice_id: string | null
          order_id: string
          payment_method: string | null
          payment_method_details: Json | null
          receipt_url: string | null
          refunded_amount: number
          status: string
          stripe_charge_id: string | null
          stripe_payment_intent_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency: string
          failure_code?: string | null
          failure_message?: string | null
          id?: string
          invoice_id?: string | null
          order_id: string
          payment_method?: string | null
          payment_method_details?: Json | null
          receipt_url?: string | null
          refunded_amount?: number
          status: string
          stripe_charge_id?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string
          failure_code?: string | null
          failure_message?: string | null
          id?: string
          invoice_id?: string | null
          order_id?: string
          payment_method?: string | null
          payment_method_details?: Json | null
          receipt_url?: string | null
          refunded_amount?: number
          status?: string
          stripe_charge_id?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      prenoms: {
        Row: {
          active: boolean
          created_at: string
          fete_date: string | null
          fete_label: string | null
          genre: Database["public"]["Enums"]["prenom_genre"]
          id: number
          origine: string | null
          photo_url: string | null
          prenom: string
          signification: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          fete_date?: string | null
          fete_label?: string | null
          genre: Database["public"]["Enums"]["prenom_genre"]
          id?: number
          origine?: string | null
          photo_url?: string | null
          prenom: string
          signification?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          fete_date?: string | null
          fete_label?: string | null
          genre?: Database["public"]["Enums"]["prenom_genre"]
          id?: number
          origine?: string | null
          photo_url?: string | null
          prenom?: string
          signification?: string | null
        }
        Relationships: []
      }
      product_uploads: {
        Row: {
          created_at: string
          file_name: string | null
          file_size: number | null
          id: string
          linked_order_id: string | null
          mime_type: string | null
          public_url: string
          storage_path: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          file_name?: string | null
          file_size?: number | null
          id?: string
          linked_order_id?: string | null
          mime_type?: string | null
          public_url: string
          storage_path: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          file_name?: string | null
          file_size?: number | null
          id?: string
          linked_order_id?: string | null
          mime_type?: string | null
          public_url?: string
          storage_path?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_uploads_linked_order_id_fkey"
            columns: ["linked_order_id"]
            isOneToOne: false
            referencedRelation: "custom_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          created_at: string
          currency: string
          id: string
          is_active: boolean
          name: string
          unit_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          id: string
          is_active?: boolean
          name: string
          unit_price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          id?: string
          is_active?: boolean
          name?: string
          unit_price?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          avatar_url: string | null
          birth_date: string | null
          city: string | null
          country: string | null
          created_at: string
          deleted_at: string | null
          display_name: string | null
          first_name: string | null
          gdpr_consent: boolean
          gdpr_consent_at: string | null
          id: string
          language: string | null
          last_name: string | null
          marketing_email: boolean
          marketing_push: boolean
          marketing_sms: boolean
          phone: string | null
          postal_code: string | null
          updated_at: string
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          avatar_url?: string | null
          birth_date?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          deleted_at?: string | null
          display_name?: string | null
          first_name?: string | null
          gdpr_consent?: boolean
          gdpr_consent_at?: string | null
          id: string
          language?: string | null
          last_name?: string | null
          marketing_email?: boolean
          marketing_push?: boolean
          marketing_sms?: boolean
          phone?: string | null
          postal_code?: string | null
          updated_at?: string
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          avatar_url?: string | null
          birth_date?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          deleted_at?: string | null
          display_name?: string | null
          first_name?: string | null
          gdpr_consent?: boolean
          gdpr_consent_at?: string | null
          id?: string
          language?: string | null
          last_name?: string | null
          marketing_email?: boolean
          marketing_push?: boolean
          marketing_sms?: boolean
          phone?: string | null
          postal_code?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      referral_codes: {
        Row: {
          code: string
          created_at: string
          id: string
          max_uses: number | null
          reward_amount: number
          updated_at: string
          user_id: string
          uses_count: number
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          max_uses?: number | null
          reward_amount?: number
          updated_at?: string
          user_id: string
          uses_count?: number
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          max_uses?: number | null
          reward_amount?: number
          updated_at?: string
          user_id?: string
          uses_count?: number
        }
        Relationships: []
      }
      referral_rewards: {
        Row: {
          created_at: string
          id: string
          order_id: string | null
          referred_id: string | null
          referrer_id: string
          reward_amount: number
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_id?: string | null
          referred_id?: string | null
          referrer_id: string
          reward_amount?: number
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string | null
          referred_id?: string | null
          referrer_id?: string
          reward_amount?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_rewards_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      role_requests: {
        Row: {
          created_at: string
          id: string
          message: string | null
          requested_role: Database["public"]["Enums"]["app_role"]
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["role_request_status"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          requested_role?: Database["public"]["Enums"]["app_role"]
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["role_request_status"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          requested_role?: Database["public"]["Enums"]["app_role"]
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["role_request_status"]
          user_id?: string
        }
        Relationships: []
      }
      saved_designs: {
        Row: {
          back_design: Json | null
          background: string | null
          colors: Json | null
          created_at: string
          dimensions: string | null
          frame: string | null
          front_design: Json | null
          id: string
          is_public: boolean
          name: string | null
          photo_url: string | null
          preview_url: string | null
          shape: string | null
          text_content: string | null
          type: Database["public"]["Enums"]["saved_design_type"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          back_design?: Json | null
          background?: string | null
          colors?: Json | null
          created_at?: string
          dimensions?: string | null
          frame?: string | null
          front_design?: Json | null
          id?: string
          is_public?: boolean
          name?: string | null
          photo_url?: string | null
          preview_url?: string | null
          shape?: string | null
          text_content?: string | null
          type?: Database["public"]["Enums"]["saved_design_type"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          back_design?: Json | null
          background?: string | null
          colors?: Json | null
          created_at?: string
          dimensions?: string | null
          frame?: string | null
          front_design?: Json | null
          id?: string
          is_public?: boolean
          name?: string | null
          photo_url?: string | null
          preview_url?: string | null
          shape?: string | null
          text_content?: string | null
          type?: Database["public"]["Enums"]["saved_design_type"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      stripe_events: {
        Row: {
          created_at: string | null
          id: string
          object: string
          processed: boolean | null
          type: string
        }
        Insert: {
          created_at?: string | null
          id: string
          object: string
          processed?: boolean | null
          type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          object?: string
          processed?: boolean | null
          type?: string
        }
        Relationships: []
      }
      support_messages: {
        Row: {
          attachments: Json | null
          content: string
          created_at: string
          id: string
          sender_type: string
          ticket_id: string
        }
        Insert: {
          attachments?: Json | null
          content: string
          created_at?: string
          id?: string
          sender_type: string
          ticket_id: string
        }
        Update: {
          attachments?: Json | null
          content?: string
          created_at?: string
          id?: string
          sender_type?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          category: string | null
          created_at: string
          id: string
          last_message_at: string | null
          priority: Database["public"]["Enums"]["ticket_priority"]
          status: Database["public"]["Enums"]["ticket_status"]
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          last_message_at?: string | null
          priority?: Database["public"]["Enums"]["ticket_priority"]
          status?: Database["public"]["Enums"]["ticket_status"]
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          last_message_at?: string | null
          priority?: Database["public"]["Enums"]["ticket_priority"]
          status?: Database["public"]["Enums"]["ticket_status"]
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      uploaded_images: {
        Row: {
          album: string | null
          created_at: string
          file_name: string | null
          file_size: number | null
          height: number | null
          id: string
          is_archived: boolean
          linked_order_id: string | null
          mime_type: string | null
          public_url: string
          storage_path: string
          updated_at: string
          user_id: string
          width: number | null
        }
        Insert: {
          album?: string | null
          created_at?: string
          file_name?: string | null
          file_size?: number | null
          height?: number | null
          id?: string
          is_archived?: boolean
          linked_order_id?: string | null
          mime_type?: string | null
          public_url: string
          storage_path: string
          updated_at?: string
          user_id: string
          width?: number | null
        }
        Update: {
          album?: string | null
          created_at?: string
          file_name?: string | null
          file_size?: number | null
          height?: number | null
          id?: string
          is_archived?: boolean
          linked_order_id?: string | null
          mime_type?: string | null
          public_url?: string
          storage_path?: string
          updated_at?: string
          user_id?: string
          width?: number | null
        }
        Relationships: []
      }
      user_devices: {
        Row: {
          browser: string | null
          created_at: string
          device_name: string | null
          device_type: string | null
          fingerprint: string | null
          id: string
          last_active_at: string | null
          os: string | null
          trusted: boolean
          user_id: string
        }
        Insert: {
          browser?: string | null
          created_at?: string
          device_name?: string | null
          device_type?: string | null
          fingerprint?: string | null
          id?: string
          last_active_at?: string | null
          os?: string | null
          trusted?: boolean
          user_id: string
        }
        Update: {
          browser?: string | null
          created_at?: string
          device_name?: string | null
          device_type?: string | null
          fingerprint?: string | null
          id?: string
          last_active_at?: string | null
          os?: string | null
          trusted?: boolean
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string
          currency: string
          email_notifications: boolean
          id: string
          language: string
          push_notifications: boolean
          sms_notifications: boolean
          theme: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          currency?: string
          email_notifications?: boolean
          id?: string
          language?: string
          push_notifications?: boolean
          sms_notifications?: boolean
          theme?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          currency?: string
          email_notifications?: boolean
          id?: string
          language?: string
          push_notifications?: boolean
          sms_notifications?: boolean
          theme?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          ip_address: string | null
          revoked_at: string | null
          token_hash: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          ip_address?: string | null
          revoked_at?: string | null
          token_hash?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          ip_address?: string | null
          revoked_at?: string | null
          token_hash?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_order_number: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      log_user_login: {
        Args: {
          p_ip_address?: string
          p_succeeded?: boolean
          p_user_agent?: string
          p_user_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      address_type: "billing" | "shipping"
      animal_espece:
        | "chat"
        | "chien"
        | "lapin"
        | "rongeur"
        | "oiseau"
        | "poisson"
        | "reptile"
        | "autre"
      app_role: "admin" | "user"
      avis_status: "pending" | "approved" | "rejected"
      genre: "fille" | "garçon" | "unisexe"
      notification_type:
        | "order"
        | "shipping"
        | "promotion"
        | "product"
        | "support"
        | "system"
      order_status:
        | "draft"
        | "pending"
        | "in_production"
        | "shipped"
        | "delivered"
        | "cancelled"
      prenom_genre: "fille" | "garcon" | "mixte"
      role_request_status: "pending" | "approved" | "rejected"
      saved_design_type: "hommage" | "prenom" | "animal" | "drapeau" | "custom"
      ticket_priority: "low" | "medium" | "high"
      ticket_status: "open" | "waiting" | "closed"
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
    Enums: {
      address_type: ["billing", "shipping"],
      animal_espece: [
        "chat",
        "chien",
        "lapin",
        "rongeur",
        "oiseau",
        "poisson",
        "reptile",
        "autre",
      ],
      app_role: ["admin", "user"],
      avis_status: ["pending", "approved", "rejected"],
      genre: ["fille", "garçon", "unisexe"],
      notification_type: [
        "order",
        "shipping",
        "promotion",
        "product",
        "support",
        "system",
      ],
      order_status: [
        "draft",
        "pending",
        "in_production",
        "shipped",
        "delivered",
        "cancelled",
      ],
      prenom_genre: ["fille", "garcon", "mixte"],
      role_request_status: ["pending", "approved", "rejected"],
      saved_design_type: ["hommage", "prenom", "animal", "drapeau", "custom"],
      ticket_priority: ["low", "medium", "high"],
      ticket_status: ["open", "waiting", "closed"],
    },
  },
} as const
