export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          short_name: string;
          description: string;
          price: number;
          original_price: number;
          currency: string;
          features: string[];
          icon_name: string;
          color: string;
          badge: string | null;
          file_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          short_name: string;
          description: string;
          price: number;
          original_price: number;
          currency?: string;
          features: string[];
          icon_name: string;
          color: string;
          badge?: string | null;
          file_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          short_name?: string;
          description?: string;
          price?: number;
          original_price?: number;
          currency?: string;
          features?: string[];
          icon_name?: string;
          color?: string;
          badge?: string | null;
          file_url?: string | null;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      cart_items: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          quantity: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          quantity?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          quantity?: number;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          order_number: string;
          total_amount: number;
          currency: string;
          razorpay_order_id: string | null;
          razorpay_payment_id: string | null;
          razorpay_signature: string | null;
          offer_code_id: string | null;
          discount_amount: number;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          order_number: string;
          total_amount: number;
          currency?: string;
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          razorpay_signature?: string | null;
          offer_code_id?: string | null;
          discount_amount?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          total_amount?: number;
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          razorpay_signature?: string | null;
          offer_code_id?: string | null;
          discount_amount?: number;
          status?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          product_name: string;
          price: number;
          quantity: number;
          file_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          product_name: string;
          price: number;
          quantity?: number;
          file_url?: string | null;
          created_at?: string;
        };
        Update: {
          product_name?: string;
          price?: number;
          quantity?: number;
          file_url?: string | null;
        };
      };
      offer_codes: {
        Row: {
          id: string;
          code: string;
          discount_type: string;
          discount_value: number;
          max_uses: number | null;
          used_count: number;
          is_active: boolean;
          valid_from: string;
          valid_until: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          discount_type: string;
          discount_value: number;
          max_uses?: number | null;
          used_count?: number;
          is_active?: boolean;
          valid_from?: string;
          valid_until?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          code?: string;
          discount_type?: string;
          discount_value?: number;
          max_uses?: number | null;
          used_count?: number;
          is_active?: boolean;
          valid_from?: string;
          valid_until?: string | null;
          updated_at?: string;
        };
      };
      offer_code_usage: {
        Row: {
          id: string;
          offer_code_id: string;
          user_id: string;
          order_id: string;
          used_at: string;
        };
        Insert: {
          id?: string;
          offer_code_id: string;
          user_id: string;
          order_id: string;
          used_at?: string;
        };
        Update: {
          offer_code_id?: string;
          user_id?: string;
          order_id?: string;
          used_at?: string;
        };
      };
    };
  };
}
