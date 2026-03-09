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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      ai_learning_insights: {
        Row: {
          created_at: string
          domain_focus: string | null
          id: string
          insight_text: string
          insight_type: string
          is_active: boolean
          session_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          domain_focus?: string | null
          id?: string
          insight_text: string
          insight_type: string
          is_active?: boolean
          session_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          domain_focus?: string | null
          id?: string
          insight_text?: string
          insight_type?: string
          is_active?: boolean
          session_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_learning_insights_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "interview_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      badges: {
        Row: {
          category: string
          color: string
          created_at: string
          description: string
          icon: string
          id: string
          is_active: boolean
          name: string
          requirement_type: string
          requirement_value: number
        }
        Insert: {
          category: string
          color?: string
          created_at?: string
          description: string
          icon: string
          id?: string
          is_active?: boolean
          name: string
          requirement_type: string
          requirement_value: number
        }
        Update: {
          category?: string
          color?: string
          created_at?: string
          description?: string
          icon?: string
          id?: string
          is_active?: boolean
          name?: string
          requirement_type?: string
          requirement_value?: number
        }
        Relationships: []
      }
      challenges: {
        Row: {
          challenged_explanation: string | null
          challenged_id: string | null
          challenged_score: number | null
          challenger_explanation: string | null
          challenger_id: string
          challenger_score: number | null
          created_at: string | null
          difficulty: string
          domain_id: string | null
          expires_at: string | null
          id: string
          question_text: string | null
          share_code: string | null
          status: string
          subtopic_id: string | null
          topic_id: string | null
        }
        Insert: {
          challenged_explanation?: string | null
          challenged_id?: string | null
          challenged_score?: number | null
          challenger_explanation?: string | null
          challenger_id: string
          challenger_score?: number | null
          created_at?: string | null
          difficulty?: string
          domain_id?: string | null
          expires_at?: string | null
          id?: string
          question_text?: string | null
          share_code?: string | null
          status?: string
          subtopic_id?: string | null
          topic_id?: string | null
        }
        Update: {
          challenged_explanation?: string | null
          challenged_id?: string | null
          challenged_score?: number | null
          challenger_explanation?: string | null
          challenger_id?: string
          challenger_score?: number | null
          created_at?: string | null
          difficulty?: string
          domain_id?: string | null
          expires_at?: string | null
          id?: string
          question_text?: string | null
          share_code?: string | null
          status?: string
          subtopic_id?: string | null
          topic_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "challenges_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "domains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenges_subtopic_id_fkey"
            columns: ["subtopic_id"]
            isOneToOne: false
            referencedRelation: "subtopics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenges_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      domains: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          type: Database["public"]["Enums"]["domain_type"]
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          type: Database["public"]["Enums"]["domain_type"]
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          type?: Database["public"]["Enums"]["domain_type"]
        }
        Relationships: []
      }
      follow_up_conversations: {
        Row: {
          answer: string | null
          answered_at: string | null
          created_at: string
          evaluation: Json | null
          id: string
          question: string
          question_intent: string | null
          reasoning_type: string
          round_number: number
          session_id: string
        }
        Insert: {
          answer?: string | null
          answered_at?: string | null
          created_at?: string
          evaluation?: Json | null
          id?: string
          question: string
          question_intent?: string | null
          reasoning_type: string
          round_number: number
          session_id: string
        }
        Update: {
          answer?: string | null
          answered_at?: string | null
          created_at?: string
          evaluation?: Json | null
          id?: string
          question?: string
          question_intent?: string | null
          reasoning_type?: string
          round_number?: number
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follow_up_conversations_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "interview_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_sessions: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          initial_code: string | null
          initial_evaluation: Json | null
          initial_explanation: string | null
          question_id: string
          reasoning_depth_score: number | null
          session_status: string
          user_id: string
          weakest_rubric: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          initial_code?: string | null
          initial_evaluation?: Json | null
          initial_explanation?: string | null
          question_id: string
          reasoning_depth_score?: number | null
          session_status?: string
          user_id: string
          weakest_rubric?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          initial_code?: string | null
          initial_evaluation?: Json | null
          initial_explanation?: string | null
          question_id?: string
          reasoning_depth_score?: number | null
          session_status?: string
          user_id?: string
          weakest_rubric?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_interview_sessions_question"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interview_sessions_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          id: string
          points: number | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id: string
          points?: number | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          points?: number | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      questions: {
        Row: {
          created_at: string | null
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          domain_id: string
          expected_concepts: string[] | null
          hints: string[] | null
          id: string
          learning_context: string | null
          question_text: string
          subtopic_id: string
          topic_id: string
        }
        Insert: {
          created_at?: string | null
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          domain_id: string
          expected_concepts?: string[] | null
          hints?: string[] | null
          id?: string
          learning_context?: string | null
          question_text: string
          subtopic_id: string
          topic_id: string
        }
        Update: {
          created_at?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          domain_id?: string
          expected_concepts?: string[] | null
          hints?: string[] | null
          id?: string
          learning_context?: string | null
          question_text?: string
          subtopic_id?: string
          topic_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "domains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_subtopic_id_fkey"
            columns: ["subtopic_id"]
            isOneToOne: false
            referencedRelation: "subtopics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      streak_freezes: {
        Row: {
          days_protected: number
          id: string
          reason: string | null
          used_at: string
          user_id: string
        }
        Insert: {
          days_protected?: number
          id?: string
          reason?: string | null
          used_at?: string
          user_id: string
        }
        Update: {
          days_protected?: number
          id?: string
          reason?: string | null
          used_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subtopics: {
        Row: {
          created_at: string | null
          id: string
          name: string
          topic_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          topic_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          topic_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subtopics_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      topics: {
        Row: {
          created_at: string | null
          domain_id: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          domain_id: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          domain_id?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "topics_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "domains"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          progress_value: number | null
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          progress_value?: number | null
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          progress_value?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_performance: {
        Row: {
          avg_score: number | null
          correct_questions: number | null
          created_at: string | null
          domain_id: string | null
          id: string
          last_practiced_at: string | null
          subtopic_id: string | null
          topic_id: string | null
          total_questions: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avg_score?: number | null
          correct_questions?: number | null
          created_at?: string | null
          domain_id?: string | null
          id?: string
          last_practiced_at?: string | null
          subtopic_id?: string | null
          topic_id?: string | null
          total_questions?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avg_score?: number | null
          correct_questions?: number | null
          created_at?: string | null
          domain_id?: string | null
          id?: string
          last_practiced_at?: string | null
          subtopic_id?: string | null
          topic_id?: string | null
          total_questions?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_performance_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "domains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_performance_subtopic_id_fkey"
            columns: ["subtopic_id"]
            isOneToOne: false
            referencedRelation: "subtopics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_performance_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      user_projects: {
        Row: {
          created_at: string
          description: string | null
          github_url: string | null
          id: string
          name: string
          tech_stack: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          github_url?: string | null
          id?: string
          name: string
          tech_stack?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          github_url?: string | null
          id?: string
          name?: string
          tech_stack?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_solved_questions: {
        Row: {
          id: string
          question_id: string
          score: number | null
          solved_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          question_id: string
          score?: number | null
          solved_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          question_id?: string
          score?: number | null
          solved_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_solved_questions_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_streaks: {
        Row: {
          created_at: string
          current_streak: number
          id: string
          last_practice_date: string | null
          longest_streak: number
          streak_freeze_count: number
          streak_start_date: string | null
          total_practice_days: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_streak?: number
          id?: string
          last_practice_date?: string | null
          longest_streak?: number
          streak_freeze_count?: number
          streak_start_date?: string | null
          total_practice_days?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_streak?: number
          id?: string
          last_practice_date?: string | null
          longest_streak?: number
          streak_freeze_count?: number
          streak_start_date?: string | null
          total_practice_days?: number
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
      difficulty_level: "beginner" | "intermediate" | "advanced"
      domain_type: "core" | "software"
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
      difficulty_level: ["beginner", "intermediate", "advanced"],
      domain_type: ["core", "software"],
    },
  },
} as const
