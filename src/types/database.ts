export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          status: string
          zone_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          status?: string
          zone_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          status?: string
          zone_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      routes: {
        Row: {
          id: string
          project_id: string
          name: string
          origin_lat: number
          origin_lng: number
          dest_lat: number
          dest_lng: number
          spacing_meters: number
          mode: string
          polyline_encoded: string | null
          total_distance_meters: number
          total_poles: number
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          name: string
          origin_lat: number
          origin_lng: number
          dest_lat: number
          dest_lng: number
          spacing_meters: number
          mode: string
          polyline_encoded?: string | null
          total_distance_meters: number
          total_poles: number
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          name?: string
          origin_lat?: number
          origin_lng?: number
          dest_lat?: number
          dest_lng?: number
          spacing_meters?: number
          mode?: string
          polyline_encoded?: string | null
          total_distance_meters?: number
          total_poles?: number
        }
        Relationships: []
      }
      poles: {
        Row: {
          id: string
          route_id: string
          sequence_number: number
          lat: number
          lng: number
          type: string
          status: string
        }
        Insert: {
          id?: string
          route_id: string
          sequence_number: number
          lat: number
          lng: number
          type: string
          status?: string
        }
        Update: {
          id?: string
          route_id?: string
          sequence_number?: number
          lat?: number
          lng?: number
          type?: string
          status?: string
        }
        Relationships: []
      }
      zones: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          email: string
          role: string
          zone_id: string | null
          full_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          role?: string
          zone_id?: string | null
          full_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: string
          zone_id?: string | null
          full_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      budget_items: {
        Row: {
          id: string
          project_id: string
          description: string
          quantity: number
          unit: string
          unit_cost: number
          total: number
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          description: string
          quantity: number
          unit: string
          unit_cost: number
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          description?: string
          quantity?: number
          unit?: string
          unit_cost?: number
        }
        Relationships: []
      }
      project_comments: {
        Row: {
          id: string
          project_id: string
          author_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          author_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          author_id?: string
          content?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          id: string
          project_id: string | null
          user_id: string
          action: string
          details: Record<string, unknown>
          created_at: string
        }
        Insert: {
          id?: string
          project_id?: string | null
          user_id: string
          action: string
          details?: Record<string, unknown>
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string | null
          user_id?: string
          action?: string
          details?: Record<string, unknown>
        }
        Relationships: []
      }
      route_segments: {
        Row: {
          id: string
          route_id: string
          from_pole: number
          to_pole: number
          symbology: string
        }
        Insert: {
          id?: string
          route_id: string
          from_pole: number
          to_pole: number
          symbology: string
        }
        Update: {
          id?: string
          route_id?: string
          from_pole?: number
          to_pole?: number
          symbology?: string
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
      line_symbology: 'single' | 'double' | 'triple'
      pole_status: 'nuevo' | 'existente' | 'en_retiro' | 'cambiar'
      user_role: 'supervisor' | 'coordinador' | 'gestor' | 'administrador'
      project_status:
        | 'borrador'
        | 'pendiente_coordinador'
        | 'rechazado'
        | 'pendiente_gestor'
        | 'contratado'
        | 'en_ejecucion'
        | 'pendiente_conciliacion'
        | 'en_correccion'
        | 'finalizado'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
