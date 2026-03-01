export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      pole_status: 'nuevo' | 'existente' | 'en_retiro' | 'cambiar'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
