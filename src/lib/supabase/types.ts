export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type Relationship = {
  foreignKeyName: string;
  columns: string[];
  referencedRelation: string;
  referencedColumns: string[];
};

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          emoji: string;
          bg_color: string;
          description: string;
          weight_units: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          emoji?: string;
          bg_color: string;
          description: string;
          weight_units?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          emoji?: string;
          bg_color?: string;
          description?: string;
          weight_units?: string[];
          created_at?: string;
        };
        Relationships: [];
      };
      subcategories: {
        Row: {
          id: string;
          category_id: string;
          name: string;
          slug: string;
          emoji: string;
          position: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          category_id: string;
          name: string;
          slug: string;
          emoji?: string;
          position?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string;
          name?: string;
          slug?: string;
          emoji?: string;
          position?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          name: string;
          category_id: string;
          subcategory_id: string | null;
          weight: string;
          price: number;
          compare_at: number | null;
          emoji: string;
          bg_color: string;
          badge: string | null;
          description: string;
          description_long: string;
          origin: string | null;
          stock: number;
          image_url: string;
          is_featured: boolean;
          featured_position: number;
          is_active: boolean;
          low_stock_threshold: number;
          slug: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category_id: string;
          subcategory_id?: string | null;
          weight: string;
          price: number;
          compare_at?: number | null;
          emoji: string;
          bg_color: string;
          badge?: string | null;
          description: string;
          description_long?: string;
          origin?: string | null;
          stock?: number;
          image_url?: string;
          is_featured?: boolean;
          featured_position?: number;
          is_active?: boolean;
          low_stock_threshold?: number;
          slug?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category_id?: string;
          subcategory_id?: string | null;
          weight?: string;
          price?: number;
          compare_at?: number | null;
          emoji?: string;
          bg_color?: string;
          badge?: string | null;
          description?: string;
          description_long?: string;
          origin?: string | null;
          stock?: number;
          image_url?: string;
          is_featured?: boolean;
          featured_position?: number;
          is_active?: boolean;
          low_stock_threshold?: number;
          slug?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "product_options_product_id_fkey";
            columns: ["id"];
            referencedRelation: "product_options";
            referencedColumns: ["id"];
          }
        ];
      };
      related_products: {
        Row: {
          product_id: string;
          related_id: string;
          created_at: string;
        };
        Insert: {
          product_id: string;
          related_id: string;
          created_at?: string;
        };
        Update: {
          product_id?: string;
          related_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "related_products_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "related_products_related_id_fkey";
            columns: ["related_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
      product_options: {
        Row: {
          id: string;
          product_id: string;
          weight: string;
          price: number;
          compare_at: number | null;
          stock: number;
          position: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          weight: string;
          price: number;
          compare_at?: number | null;
          stock?: number;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          weight?: string;
          price?: number;
          compare_at?: number | null;
          stock?: number;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_options_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          url: string;
          alt: string;
          position: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          url: string;
          alt?: string;
          position?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          url?: string;
          alt?: string;
          position?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
      orders: {
        Row: {
          id: string;
          user_id: string | null;
          status: string;
          subtotal: number;
          delivery: number;
          discount: number;
          discount_label: string | null;
          gift_card_code: string | null;
          gift_card_used: number;
          total: number;
          address: Json;
          courier: string | null;
          tracking_number: string | null;
          estimated_delivery: string | null;
          payment_intent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          status?: string;
          subtotal: number;
          delivery?: number;
          discount?: number;
          discount_label?: string | null;
          gift_card_code?: string | null;
          gift_card_used?: number;
          total: number;
          address: Json;
          courier?: string | null;
          tracking_number?: string | null;
          estimated_delivery?: string | null;
          payment_intent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          status?: string;
          subtotal?: number;
          delivery?: number;
          discount?: number;
          discount_label?: string | null;
          gift_card_code?: string | null;
          gift_card_used?: number;
          total?: number;
          address?: Json;
          courier?: string | null;
          tracking_number?: string | null;
          estimated_delivery?: string | null;
          payment_intent?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          qty: number;
          unit_price: number;
          weight: string;
          option_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          qty: number;
          unit_price: number;
          weight?: string;
          option_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          qty?: number;
          unit_price?: number;
          weight?: string;
          option_id?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
      order_events: {
        Row: {
          id: string;
          order_id: string;
          event: string;
          message: string | null;
          actor: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          event: string;
          message?: string | null;
          actor?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          event?: string;
          message?: string | null;
          actor?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "order_events_order_id_fkey";
            columns: ["order_id"];
            referencedRelation: "orders";
            referencedColumns: ["id"];
          }
        ];
      };
      profiles: {        Row: {
          id: string;
          name: string | null;
          email: string | null;
          phone: string | null;
          avatar_url: string | null;
          currency: string | null;
          password_hash: string | null;
          email_verified_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name?: string | null;
          email?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          currency?: string | null;
          password_hash?: string | null;
          email_verified_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string | null;
          email?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          currency?: string | null;
          password_hash?: string | null;
          email_verified_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      currencies: {
        Row: {
          code: string;
          name: string;
          symbol: string;
          rate_to_base: number;
          auto_update: boolean;
          updated_at: string;
        };
        Insert: {
          code: string;
          name: string;
          symbol: string;
          rate_to_base?: number;
          auto_update?: boolean;
          updated_at?: string;
        };
        Update: {
          code?: string;
          name?: string;
          symbol?: string;
          rate_to_base?: number;
          auto_update?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      shipping_settings: {
        Row: {
          id: string;
          base_fee: number;
          per_kg_fee: number;
          free_delivery_threshold: number;
          enabled: boolean;
          updated_at: string;
        };
        Insert: {
          id?: string;
          base_fee?: number;
          per_kg_fee?: number;
          free_delivery_threshold?: number;
          enabled?: boolean;
          updated_at?: string;
        };
        Update: {
          id?: string;
          base_fee?: number;
          per_kg_fee?: number;
          free_delivery_threshold?: number;
          enabled?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      blog_posts: {
        Row: {
          id: string;
          slug: string;
          title: string;
          excerpt: string;
          category: string;
          read_time: string;
          emoji: string;
          bg_color: string;
          author: string;
          date: string;
          body: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          excerpt: string;
          category: string;
          read_time: string;
          emoji: string;
          bg_color: string;
          author: string;
          date: string;
          body: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          excerpt?: string;
          category?: string;
          read_time?: string;
          emoji?: string;
          bg_color?: string;
          author?: string;
          date?: string;
          body?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      recipes: {
        Row: {
          id: string;
          slug: string;
          title: string;
          time: string;
          serves: number;
          level: string;
          emoji: string;
          bg_color: string;
          intro: string;
          ingredients: Json;
          steps: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          time: string;
          serves: number;
          level: string;
          emoji: string;
          bg_color: string;
          intro: string;
          ingredients: Json;
          steps: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          time?: string;
          serves?: number;
          level?: string;
          emoji?: string;
          bg_color?: string;
          intro?: string;
          ingredients?: Json;
          steps?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      admin_roles: {
        Row: {
          id: string;
          user_id: string;
          role: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "admin_roles_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      cart_items: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          qty: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          qty?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          qty?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "cart_items_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cart_items_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
      wishlist_items: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "wishlist_items_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "wishlist_items_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
      notifications: {
        Row: {
          id: string;
          scope: string;
          user_id: string | null;
          type: string;
          title: string;
          body: string;
          link: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          scope: string;
          user_id?: string | null;
          type?: string;
          title: string;
          body?: string;
          link?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          scope?: string;
          user_id?: string | null;
          type?: string;
          title?: string;
          body?: string;
          link?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      auth_codes: {
        Row: {
          id: string;
          user_id: string;
          code_hash: string;
          purpose: string;
          attempts: number;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          code_hash: string;
          purpose?: string;
          attempts?: number;
          expires_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          code_hash?: string;
          purpose?: string;
          attempts?: number;
          expires_at?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "auth_codes_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      sessions: {
        Row: {
          id: string;
          user_id: string;
          token_hash: string;
          expires_at: string;
          last_seen_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          token_hash: string;
          expires_at: string;
          last_seen_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          token_hash?: string;
          expires_at?: string;
          last_seen_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "sessions_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      addresses: {
        Row: {
          id: string;
          user_id: string;
          label: string;
          name: string;
          line1: string;
          line2: string | null;
          city: string;
          postcode: string;
          country: string;
          is_default: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          label?: string;
          name: string;
          line1: string;
          line2?: string | null;
          city: string;
          postcode: string;
          country?: string;
          is_default?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          label?: string;
          name?: string;
          line1?: string;
          line2?: string | null;
          city?: string;
          postcode?: string;
          country?: string;
          is_default?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "addresses_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      payment_methods: {
        Row: {
          id: string;
          user_id: string;
          brand: string;
          last4: string;
          expiry: string;
          is_default: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          brand: string;
          last4: string;
          expiry: string;
          is_default?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          brand?: string;
          last4?: string;
          expiry?: string;
          is_default?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payment_methods_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      reviews: {
        Row: {
          id: string;
          product_id: string;
          user_id: string;
          rating: number;
          title: string;
          body: string;
          is_approved: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          user_id: string;
          rating: number;
          title?: string;
          body?: string;
          is_approved?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          user_id?: string;
          rating?: number;
          title?: string;
          body?: string;
          is_approved?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      promo_codes: {
        Row: {
          id: string;
          code: string;
          description: string;
          discount_type: string;
          discount_value: number;
          min_subtotal: number;
          max_discount: number | null;
          starts_at: string | null;
          expires_at: string | null;
          usage_limit: number | null;
          used_count: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          description?: string;
          discount_type: string;
          discount_value: number;
          min_subtotal?: number;
          max_discount?: number | null;
          starts_at?: string | null;
          expires_at?: string | null;
          usage_limit?: number | null;
          used_count?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          description?: string;
          discount_type?: string;
          discount_value?: number;
          min_subtotal?: number;
          max_discount?: number | null;
          starts_at?: string | null;
          expires_at?: string | null;
          usage_limit?: number | null;
          used_count?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      gift_cards: {
        Row: {
          id: string;
          code: string;
          original_amount: number;
          balance: number;
          recipient_email: string;
          recipient_name: string | null;
          sender_name: string | null;
          message: string | null;
          stripe_payment_intent: string | null;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          original_amount: number;
          balance: number;
          recipient_email: string;
          recipient_name?: string | null;
          sender_name?: string | null;
          message?: string | null;
          stripe_payment_intent?: string | null;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          original_amount?: number;
          balance?: number;
          recipient_email?: string;
          recipient_name?: string | null;
          sender_name?: string | null;
          message?: string | null;
          stripe_payment_intent?: string | null;
          status?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      cart_reminders: {
        Row: {
          id: string;
          user_id: string;
          sent_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          sent_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          sent_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "cart_reminders_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
