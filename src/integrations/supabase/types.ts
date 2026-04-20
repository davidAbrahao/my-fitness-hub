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
      body_metrics: {
        Row: {
          arm: number | null
          body_fat: number | null
          chest: number | null
          created_at: string
          date: string
          hip: number | null
          id: string
          notes: string | null
          photo_url: string | null
          thigh: number | null
          updated_at: string
          user_id: string
          waist: number | null
          weight: number | null
        }
        Insert: {
          arm?: number | null
          body_fat?: number | null
          chest?: number | null
          created_at?: string
          date: string
          hip?: number | null
          id?: string
          notes?: string | null
          photo_url?: string | null
          thigh?: number | null
          updated_at?: string
          user_id: string
          waist?: number | null
          weight?: number | null
        }
        Update: {
          arm?: number | null
          body_fat?: number | null
          chest?: number | null
          created_at?: string
          date?: string
          hip?: number | null
          id?: string
          notes?: string | null
          photo_url?: string | null
          thigh?: number | null
          updated_at?: string
          user_id?: string
          waist?: number | null
          weight?: number | null
        }
        Relationships: []
      }
      exercises_logs: {
        Row: {
          created_at: string
          exercise_id: string
          exercise_name: string
          id: string
          notes: string | null
          rpe: number | null
          sets: Json
          user_id: string
          workout_id: string
        }
        Insert: {
          created_at?: string
          exercise_id: string
          exercise_name: string
          id?: string
          notes?: string | null
          rpe?: number | null
          sets?: Json
          user_id: string
          workout_id: string
        }
        Update: {
          created_at?: string
          exercise_id?: string
          exercise_name?: string
          id?: string
          notes?: string | null
          rpe?: number | null
          sets?: Json
          user_id?: string
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercises_logs_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      habits_logs: {
        Row: {
          cardio: boolean
          created_at: string
          creatine: boolean
          date: string
          diet_ok: boolean
          energy_level: number | null
          hunger_level: number | null
          id: string
          mood_level: number | null
          notes: string | null
          sleep_hours: number | null
          sugar_urge: number | null
          supplements: boolean
          updated_at: string
          user_id: string
          water: boolean
          workout_done: boolean
        }
        Insert: {
          cardio?: boolean
          created_at?: string
          creatine?: boolean
          date: string
          diet_ok?: boolean
          energy_level?: number | null
          hunger_level?: number | null
          id?: string
          mood_level?: number | null
          notes?: string | null
          sleep_hours?: number | null
          sugar_urge?: number | null
          supplements?: boolean
          updated_at?: string
          user_id: string
          water?: boolean
          workout_done?: boolean
        }
        Update: {
          cardio?: boolean
          created_at?: string
          creatine?: boolean
          date?: string
          diet_ok?: boolean
          energy_level?: number | null
          hunger_level?: number | null
          id?: string
          mood_level?: number | null
          notes?: string | null
          sleep_hours?: number | null
          sugar_urge?: number | null
          supplements?: boolean
          updated_at?: string
          user_id?: string
          water?: boolean
          workout_done?: boolean
        }
        Relationships: []
      }
      nutrition_logs: {
        Row: {
          calories: number | null
          carbs: number | null
          created_at: string
          date: string
          fat: number | null
          id: string
          meals: Json | null
          notes: string | null
          protein: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          calories?: number | null
          carbs?: number | null
          created_at?: string
          date: string
          fat?: number | null
          id?: string
          meals?: Json | null
          notes?: string | null
          protein?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          calories?: number | null
          carbs?: number | null
          created_at?: string
          date?: string
          fat?: number | null
          id?: string
          meals?: Json | null
          notes?: string | null
          protein?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      personal_records: {
        Row: {
          created_at: string
          date: string
          estimated_1rm: number
          exercise_id: string
          exercise_name: string
          id: string
          notes: string | null
          reps: number
          user_id: string
          weight: number
        }
        Insert: {
          created_at?: string
          date: string
          estimated_1rm: number
          exercise_id: string
          exercise_name: string
          id?: string
          notes?: string | null
          reps: number
          user_id: string
          weight: number
        }
        Update: {
          created_at?: string
          date?: string
          estimated_1rm?: number
          exercise_id?: string
          exercise_name?: string
          id?: string
          notes?: string | null
          reps?: number
          user_id?: string
          weight?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          age: number | null
          calorie_target: number | null
          created_at: string
          current_focus: string | null
          goal_bf_pct: number | null
          goal_weight_kg: number | null
          height_cm: number | null
          id: string
          notes: string | null
          preferences: string[] | null
          restrictions: string[] | null
          start_bf_pct: number | null
          start_weight_kg: number | null
          training_schedule: Json | null
          training_time: string | null
          triggers: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          age?: number | null
          calorie_target?: number | null
          created_at?: string
          current_focus?: string | null
          goal_bf_pct?: number | null
          goal_weight_kg?: number | null
          height_cm?: number | null
          id?: string
          notes?: string | null
          preferences?: string[] | null
          restrictions?: string[] | null
          start_bf_pct?: number | null
          start_weight_kg?: number | null
          training_schedule?: Json | null
          training_time?: string | null
          triggers?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          age?: number | null
          calorie_target?: number | null
          created_at?: string
          current_focus?: string | null
          goal_bf_pct?: number | null
          goal_weight_kg?: number | null
          height_cm?: number | null
          id?: string
          notes?: string | null
          preferences?: string[] | null
          restrictions?: string[] | null
          start_bf_pct?: number | null
          start_weight_kg?: number | null
          training_schedule?: Json | null
          training_time?: string | null
          triggers?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      workouts: {
        Row: {
          calories_estimated: number | null
          created_at: string
          date: string
          duration_min: number | null
          id: string
          notes: string | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          calories_estimated?: number | null
          created_at?: string
          date: string
          duration_min?: number | null
          id?: string
          notes?: string | null
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          calories_estimated?: number | null
          created_at?: string
          date?: string
          duration_min?: number | null
          id?: string
          notes?: string | null
          type?: string
          updated_at?: string
          user_id?: string
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
