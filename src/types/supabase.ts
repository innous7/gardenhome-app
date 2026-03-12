export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          phone: string | null;
          role: Database["public"]["Enums"]["user_role"];
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          phone?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          phone?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      companies: {
        Row: {
          id: string;
          user_id: string;
          company_name: string;
          business_number: string;
          business_license_url: string | null;
          representative: string;
          description: string;
          logo_url: string | null;
          cover_image_url: string | null;
          address: string;
          phone: string;
          specialties: Json;
          service_areas: Json;
          established: string | null;
          is_verified: boolean;
          is_approved: boolean;
          rating: number;
          review_count: number;
          project_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          company_name: string;
          business_number: string;
          business_license_url?: string | null;
          representative: string;
          description?: string;
          logo_url?: string | null;
          cover_image_url?: string | null;
          address: string;
          phone: string;
          specialties?: Json;
          service_areas?: Json;
          established?: string | null;
          is_verified?: boolean;
          is_approved?: boolean;
          rating?: number;
          review_count?: number;
          project_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          company_name?: string;
          business_number?: string;
          business_license_url?: string | null;
          representative?: string;
          description?: string;
          logo_url?: string | null;
          cover_image_url?: string | null;
          address?: string;
          phone?: string;
          specialties?: Json;
          service_areas?: Json;
          established?: string | null;
          is_verified?: boolean;
          is_approved?: boolean;
          rating?: number;
          review_count?: number;
          project_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "companies_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      portfolios: {
        Row: {
          id: string;
          company_id: string;
          title: string;
          content: string;
          excerpt: string;
          cover_image_url: string | null;
          before_images: Json;
          after_images: Json;
          process_images: Json;
          project_type: Database["public"]["Enums"]["project_type"];
          style: Database["public"]["Enums"]["garden_style"];
          area: number | null;
          duration: string | null;
          location: string | null;
          budget: string | null;
          plants: Json;
          materials: Json;
          is_published: boolean;
          views: number;
          likes: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          title: string;
          content?: string;
          excerpt?: string;
          cover_image_url?: string | null;
          before_images?: Json;
          after_images?: Json;
          process_images?: Json;
          project_type: Database["public"]["Enums"]["project_type"];
          style: Database["public"]["Enums"]["garden_style"];
          area?: number | null;
          duration?: string | null;
          location?: string | null;
          budget?: string | null;
          plants?: Json;
          materials?: Json;
          is_published?: boolean;
          views?: number;
          likes?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          title?: string;
          content?: string;
          excerpt?: string;
          cover_image_url?: string | null;
          before_images?: Json;
          after_images?: Json;
          process_images?: Json;
          project_type?: Database["public"]["Enums"]["project_type"];
          style?: Database["public"]["Enums"]["garden_style"];
          area?: number | null;
          duration?: string | null;
          location?: string | null;
          budget?: string | null;
          plants?: Json;
          materials?: Json;
          is_published?: boolean;
          views?: number;
          likes?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "portfolios_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          }
        ];
      };
      quote_requests: {
        Row: {
          id: string;
          customer_id: string;
          project_type: Database["public"]["Enums"]["project_type"];
          style: Database["public"]["Enums"]["garden_style"] | null;
          location: string;
          area: number;
          current_photos: Json;
          reference_images: Json;
          budget: string | null;
          preferred_schedule: string | null;
          requirements: string;
          extras: Json;
          status: Database["public"]["Enums"]["quote_request_status"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          project_type: Database["public"]["Enums"]["project_type"];
          style?: Database["public"]["Enums"]["garden_style"] | null;
          location: string;
          area: number;
          current_photos?: Json;
          reference_images?: Json;
          budget?: string | null;
          preferred_schedule?: string | null;
          requirements?: string;
          extras?: Json;
          status?: Database["public"]["Enums"]["quote_request_status"];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          project_type?: Database["public"]["Enums"]["project_type"];
          style?: Database["public"]["Enums"]["garden_style"] | null;
          location?: string;
          area?: number;
          current_photos?: Json;
          reference_images?: Json;
          budget?: string | null;
          preferred_schedule?: string | null;
          requirements?: string;
          extras?: Json;
          status?: Database["public"]["Enums"]["quote_request_status"];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "quote_requests_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      quotes: {
        Row: {
          id: string;
          quote_request_id: string;
          company_id: string;
          customer_id: string;
          items: Json;
          subtotal: number;
          tax: number;
          total: number;
          valid_until: string | null;
          notes: string;
          payment_terms: string;
          version: number;
          status: Database["public"]["Enums"]["quote_status"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          quote_request_id: string;
          company_id: string;
          customer_id: string;
          items?: Json;
          subtotal?: number;
          tax?: number;
          total?: number;
          valid_until?: string | null;
          notes?: string;
          payment_terms?: string;
          version?: number;
          status?: Database["public"]["Enums"]["quote_status"];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          quote_request_id?: string;
          company_id?: string;
          customer_id?: string;
          items?: Json;
          subtotal?: number;
          tax?: number;
          total?: number;
          valid_until?: string | null;
          notes?: string;
          payment_terms?: string;
          version?: number;
          status?: Database["public"]["Enums"]["quote_status"];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "quotes_quote_request_id_fkey";
            columns: ["quote_request_id"];
            isOneToOne: false;
            referencedRelation: "quote_requests";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quotes_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quotes_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      contracts: {
        Row: {
          id: string;
          quote_id: string;
          company_id: string;
          customer_id: string;
          content: string;
          start_date: string | null;
          end_date: string | null;
          total_amount: number;
          payment_schedule: Json;
          warranty_terms: string;
          special_terms: string;
          customer_signature: string | null;
          company_signature: string | null;
          status: Database["public"]["Enums"]["contract_status"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          quote_id: string;
          company_id: string;
          customer_id: string;
          content?: string;
          start_date?: string | null;
          end_date?: string | null;
          total_amount?: number;
          payment_schedule?: Json;
          warranty_terms?: string;
          special_terms?: string;
          customer_signature?: string | null;
          company_signature?: string | null;
          status?: Database["public"]["Enums"]["contract_status"];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          quote_id?: string;
          company_id?: string;
          customer_id?: string;
          content?: string;
          start_date?: string | null;
          end_date?: string | null;
          total_amount?: number;
          payment_schedule?: Json;
          warranty_terms?: string;
          special_terms?: string;
          customer_signature?: string | null;
          company_signature?: string | null;
          status?: Database["public"]["Enums"]["contract_status"];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "contracts_quote_id_fkey";
            columns: ["quote_id"];
            isOneToOne: false;
            referencedRelation: "quotes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "contracts_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "contracts_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      blog_posts: {
        Row: {
          id: string;
          author_id: string;
          title: string;
          slug: string;
          content: string;
          excerpt: string;
          cover_image_url: string | null;
          category: Database["public"]["Enums"]["blog_category"];
          tags: Json;
          is_published: boolean;
          published_at: string | null;
          views: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          author_id: string;
          title: string;
          slug: string;
          content?: string;
          excerpt?: string;
          cover_image_url?: string | null;
          category: Database["public"]["Enums"]["blog_category"];
          tags?: Json;
          is_published?: boolean;
          published_at?: string | null;
          views?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          author_id?: string;
          title?: string;
          slug?: string;
          content?: string;
          excerpt?: string;
          cover_image_url?: string | null;
          category?: Database["public"]["Enums"]["blog_category"];
          tags?: Json;
          is_published?: boolean;
          published_at?: string | null;
          views?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      reviews: {
        Row: {
          id: string;
          project_id: string | null;
          customer_id: string;
          company_id: string;
          rating: number;
          design_rating: number;
          quality_rating: number;
          communication_rating: number;
          schedule_rating: number;
          value_rating: number;
          content: string;
          images: Json;
          company_reply: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id?: string | null;
          customer_id: string;
          company_id: string;
          rating: number;
          design_rating: number;
          quality_rating: number;
          communication_rating: number;
          schedule_rating: number;
          value_rating: number;
          content?: string;
          images?: Json;
          company_reply?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string | null;
          customer_id?: string;
          company_id?: string;
          rating?: number;
          design_rating?: number;
          quality_rating?: number;
          communication_rating?: number;
          schedule_rating?: number;
          value_rating?: number;
          content?: string;
          images?: Json;
          company_reply?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reviews_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          }
        ];
      };
      flotren_subscriptions: {
        Row: {
          id: string;
          customer_id: string;
          plan: Database["public"]["Enums"]["flotren_plan"];
          garden_area: number | null;
          monthly_price: number;
          start_date: string;
          status: Database["public"]["Enums"]["subscription_status"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          plan: Database["public"]["Enums"]["flotren_plan"];
          garden_area?: number | null;
          monthly_price: number;
          start_date: string;
          status?: Database["public"]["Enums"]["subscription_status"];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          plan?: Database["public"]["Enums"]["flotren_plan"];
          garden_area?: number | null;
          monthly_price?: number;
          start_date?: string;
          status?: Database["public"]["Enums"]["subscription_status"];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "flotren_subscriptions_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      chat_rooms: {
        Row: {
          id: string;
          customer_id: string;
          company_id: string;
          quote_request_id: string | null;
          last_message: string | null;
          last_message_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          company_id: string;
          quote_request_id?: string | null;
          last_message?: string | null;
          last_message_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          company_id?: string;
          quote_request_id?: string | null;
          last_message?: string | null;
          last_message_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "chat_rooms_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "chat_rooms_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          }
        ];
      };
      messages: {
        Row: {
          id: string;
          chat_room_id: string;
          sender_id: string;
          content: string;
          attachments: Json;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          chat_room_id: string;
          sender_id: string;
          content: string;
          attachments?: Json;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          chat_room_id?: string;
          sender_id?: string;
          content?: string;
          attachments?: Json;
          is_read?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "messages_chat_room_id_fkey";
            columns: ["chat_room_id"];
            isOneToOne: false;
            referencedRelation: "chat_rooms";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_sender_id_fkey";
            columns: ["sender_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      scraps: {
        Row: {
          id: string;
          user_id: string;
          portfolio_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          portfolio_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          portfolio_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "scraps_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "scraps_portfolio_id_fkey";
            columns: ["portfolio_id"];
            isOneToOne: false;
            referencedRelation: "portfolios";
            referencedColumns: ["id"];
          }
        ];
      };
      projects: {
        Row: {
          id: string;
          contract_id: string;
          company_id: string;
          customer_id: string;
          title: string;
          status: string;
          progress: number;
          start_date: string | null;
          expected_end_date: string | null;
          actual_end_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          contract_id: string;
          company_id: string;
          customer_id: string;
          title?: string;
          status?: string;
          progress?: number;
          start_date?: string | null;
          expected_end_date?: string | null;
          actual_end_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          contract_id?: string;
          company_id?: string;
          customer_id?: string;
          title?: string;
          status?: string;
          progress?: number;
          start_date?: string | null;
          expected_end_date?: string | null;
          actual_end_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "projects_contract_id_fkey";
            columns: ["contract_id"];
            isOneToOne: false;
            referencedRelation: "contracts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "projects_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "projects_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      project_milestones: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          description: string;
          images: Json;
          is_completed: boolean;
          completed_at: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          title: string;
          description?: string;
          images?: Json;
          is_completed?: boolean;
          completed_at?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          title?: string;
          description?: string;
          images?: Json;
          is_completed?: boolean;
          completed_at?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "project_milestones_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          }
        ];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          link: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          message?: string;
          link?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          title?: string;
          message?: string;
          link?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      community_posts: {
        Row: {
          id: string;
          author_id: string;
          type: string;
          title: string;
          content: string;
          images: Json;
          tags: Json;
          like_count: number;
          comment_count: number;
          view_count: number;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          author_id: string;
          type: string;
          title: string;
          content?: string;
          images?: Json;
          tags?: Json;
          like_count?: number;
          comment_count?: number;
          view_count?: number;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          author_id?: string;
          type?: string;
          title?: string;
          content?: string;
          images?: Json;
          tags?: Json;
          like_count?: number;
          comment_count?: number;
          view_count?: number;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "community_posts_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      community_comments: {
        Row: {
          id: string;
          post_id: string;
          author_id: string;
          content: string;
          parent_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          author_id: string;
          content: string;
          parent_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          author_id?: string;
          content?: string;
          parent_id?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "community_comments_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "community_posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "community_comments_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      community_likes: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "community_likes_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "community_posts";
            referencedColumns: ["id"];
          }
        ];
      };
      plants: {
        Row: {
          id: string;
          name: string;
          scientific_name: string | null;
          category: string;
          description: string;
          image_url: string | null;
          images: Json;
          sunlight: string | null;
          watering: string | null;
          difficulty: string | null;
          growth_rate: string | null;
          climate_zones: Json;
          flowering_season: Json;
          height_min: number | null;
          height_max: number | null;
          tags: Json;
          care_tips: string;
          planting_tips: string;
          pruning_tips: string;
          view_count: number;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          scientific_name?: string | null;
          category: string;
          description?: string;
          image_url?: string | null;
          images?: Json;
          sunlight?: string | null;
          watering?: string | null;
          difficulty?: string | null;
          growth_rate?: string | null;
          climate_zones?: Json;
          flowering_season?: Json;
          height_min?: number | null;
          height_max?: number | null;
          tags?: Json;
          care_tips?: string;
          planting_tips?: string;
          pruning_tips?: string;
          view_count?: number;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          scientific_name?: string | null;
          category?: string;
          description?: string;
          image_url?: string | null;
          images?: Json;
          sunlight?: string | null;
          watering?: string | null;
          difficulty?: string | null;
          growth_rate?: string | null;
          climate_zones?: Json;
          flowering_season?: Json;
          height_min?: number | null;
          height_max?: number | null;
          tags?: Json;
          care_tips?: string;
          planting_tips?: string;
          pruning_tips?: string;
          view_count?: number;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      plant_tips: {
        Row: {
          id: string;
          plant_id: string;
          author_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          plant_id: string;
          author_id: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          plant_id?: string;
          author_id?: string;
          content?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "plant_tips_plant_id_fkey";
            columns: ["plant_id"];
            isOneToOne: false;
            referencedRelation: "plants";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {};
    Functions: {};
    Enums: {
      user_role: "CUSTOMER" | "COMPANY" | "ADMIN";
      project_type: "GARDEN" | "ROOFTOP" | "VERANDA" | "COMMERCIAL" | "OTHER";
      garden_style: "MODERN" | "TRADITIONAL" | "NATURAL" | "MINIMAL" | "ENGLISH" | "JAPANESE" | "MIXED";
      quote_request_status: "PENDING" | "MATCHED" | "COMPLETED" | "CANCELLED";
      quote_status: "DRAFT" | "SENT" | "VIEWED" | "ACCEPTED" | "REJECTED";
      contract_status: "DRAFT" | "REVIEW" | "PENDING_SIGN" | "SIGNED" | "COMPLETED" | "CANCELLED";
      blog_category: "TREND" | "PLANT_GUIDE" | "TIPS" | "SEASONAL" | "COST_GUIDE" | "CASE_STUDY" | "NEWS";
      flotren_plan: "BASIC" | "STANDARD" | "PREMIUM";
      subscription_status: "ACTIVE" | "PAUSED" | "CANCELLED";
      payment_status: "PENDING" | "PAID";
    };
    CompositeTypes: {};
  };
};

// Helper types
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];
