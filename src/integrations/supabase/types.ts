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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      alv_asetukset: {
        Row: {
          alv_prosentti: number
          company_id: string
          created_at: string
          id: string
          is_active: boolean
          is_default: boolean
          nimi: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          alv_prosentti: number
          company_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_default?: boolean
          nimi: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          alv_prosentti?: number
          company_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_default?: boolean
          nimi?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      asiakkaat: {
        Row: {
          alv_numero: string | null
          company_id: string
          created_at: string | null
          email: string | null
          id: string
          nimi: string
          numero: string | null
          osoite: string | null
          puhelin: string | null
          tyyppi: string | null
          user_id: string | null
          y_tunnus: string | null
          yksityiset_muistiinpanot: string | null
          yrityksen_nimi: string | null
        }
        Insert: {
          alv_numero?: string | null
          company_id: string
          created_at?: string | null
          email?: string | null
          id?: string
          nimi: string
          numero?: string | null
          osoite?: string | null
          puhelin?: string | null
          tyyppi?: string | null
          user_id?: string | null
          y_tunnus?: string | null
          yksityiset_muistiinpanot?: string | null
          yrityksen_nimi?: string | null
        }
        Update: {
          alv_numero?: string | null
          company_id?: string
          created_at?: string | null
          email?: string | null
          id?: string
          nimi?: string
          numero?: string | null
          osoite?: string | null
          puhelin?: string | null
          tyyppi?: string | null
          user_id?: string | null
          y_tunnus?: string | null
          yksityiset_muistiinpanot?: string | null
          yrityksen_nimi?: string | null
        }
        Relationships: []
      }
      hinnoittelu_asetukset: {
        Row: {
          company_id: string
          created_at: string
          hinnoittelu_tyyppi: string | null
          id: string
          is_active: boolean | null
          kiintea_hinta: number | null
          nimi: string
          oletushinnoittelu_tyyppi: string | null
          oletustuntihinta: number | null
          sisaltaa_alv: boolean | null
          updated_at: string
          user_id: string | null
          yksikko: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          hinnoittelu_tyyppi?: string | null
          id?: string
          is_active?: boolean | null
          kiintea_hinta?: number | null
          nimi: string
          oletushinnoittelu_tyyppi?: string | null
          oletustuntihinta?: number | null
          sisaltaa_alv?: boolean | null
          updated_at?: string
          user_id?: string | null
          yksikko?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          hinnoittelu_tyyppi?: string | null
          id?: string
          is_active?: boolean | null
          kiintea_hinta?: number | null
          nimi?: string
          oletushinnoittelu_tyyppi?: string | null
          oletustuntihinta?: number | null
          sisaltaa_alv?: boolean | null
          updated_at?: string
          user_id?: string | null
          yksikko?: string | null
        }
        Relationships: []
      }
      huollot: {
        Row: {
          ajanlaskuri_aloitettu_pvm: string | null
          ajanlaskuri_kaynnissa: boolean | null
          arvioitu_tyoaika_minuutit: number | null
          arvioitu_valmistumispvm: string | null
          asiakas_allekirjoitus: string | null
          asiakas_id: string | null
          company_id: string
          created_at: string
          hinnoittelu_nimi: string | null
          hinnoittelu_tyyppi: string | null
          id: string
          kiintea_hinta: number | null
          kuvaus: string | null
          laite_id: string | null
          luovutettu_pvm: string | null
          malli: string | null
          merkki: string | null
          numero: string | null
          osatakuu_kuukautta: number | null
          sarjanumero: string | null
          status: string
          teknikko_allekirjoitus: string | null
          teknikko_id: string | null
          teknikon_muistiinpanot: string | null
          tuntihinta: number | null
          tyoaika_minuutit: number | null
          tyotakuu_kuukautta: number | null
          user_id: string | null
          valmistunut_pvm: string | null
        }
        Insert: {
          ajanlaskuri_aloitettu_pvm?: string | null
          ajanlaskuri_kaynnissa?: boolean | null
          arvioitu_tyoaika_minuutit?: number | null
          arvioitu_valmistumispvm?: string | null
          asiakas_allekirjoitus?: string | null
          asiakas_id?: string | null
          company_id: string
          created_at?: string
          hinnoittelu_nimi?: string | null
          hinnoittelu_tyyppi?: string | null
          id?: string
          kiintea_hinta?: number | null
          kuvaus?: string | null
          laite_id?: string | null
          luovutettu_pvm?: string | null
          malli?: string | null
          merkki?: string | null
          numero?: string | null
          osatakuu_kuukautta?: number | null
          sarjanumero?: string | null
          status?: string
          teknikko_allekirjoitus?: string | null
          teknikko_id?: string | null
          teknikon_muistiinpanot?: string | null
          tuntihinta?: number | null
          tyoaika_minuutit?: number | null
          tyotakuu_kuukautta?: number | null
          user_id?: string | null
          valmistunut_pvm?: string | null
        }
        Update: {
          ajanlaskuri_aloitettu_pvm?: string | null
          ajanlaskuri_kaynnissa?: boolean | null
          arvioitu_tyoaika_minuutit?: number | null
          arvioitu_valmistumispvm?: string | null
          asiakas_allekirjoitus?: string | null
          asiakas_id?: string | null
          company_id?: string
          created_at?: string
          hinnoittelu_nimi?: string | null
          hinnoittelu_tyyppi?: string | null
          id?: string
          kiintea_hinta?: number | null
          kuvaus?: string | null
          laite_id?: string | null
          luovutettu_pvm?: string | null
          malli?: string | null
          merkki?: string | null
          numero?: string | null
          osatakuu_kuukautta?: number | null
          sarjanumero?: string | null
          status?: string
          teknikko_allekirjoitus?: string | null
          teknikko_id?: string | null
          teknikon_muistiinpanot?: string | null
          tuntihinta?: number | null
          tyoaika_minuutit?: number | null
          tyotakuu_kuukautta?: number | null
          user_id?: string | null
          valmistunut_pvm?: string | null
        }
        Relationships: []
      }
      huolto_varaosat: {
        Row: {
          company_id: string
          created_at: string
          huolto_id: string
          id: string
          maara: number
          varaosa_id: string
          yksikkohinta: number
        }
        Insert: {
          company_id: string
          created_at?: string
          huolto_id: string
          id?: string
          maara?: number
          varaosa_id: string
          yksikkohinta?: number
        }
        Update: {
          company_id?: string
          created_at?: string
          huolto_id?: string
          id?: string
          maara?: number
          varaosa_id?: string
          yksikkohinta?: number
        }
        Relationships: []
      }
      ilmoitus_asetukset: {
        Row: {
          company_id: string
          created_at: string
          huolto_valmis_kaytossa: boolean
          huolto_valmis_pohja: string
          id: string
          lasku_eraantynyt_kaytossa: boolean
          lasku_eraantynyt_paivat: number
          lasku_eraantynyt_pohja: string
          testiviesti_email: string | null
          updated_at: string
          user_id: string | null
          varasto_varoitus_email: string | null
          varasto_varoitus_kaytossa: boolean
        }
        Insert: {
          company_id: string
          created_at?: string
          huolto_valmis_kaytossa?: boolean
          huolto_valmis_pohja?: string
          id?: string
          lasku_eraantynyt_kaytossa?: boolean
          lasku_eraantynyt_paivat?: number
          lasku_eraantynyt_pohja?: string
          testiviesti_email?: string | null
          updated_at?: string
          user_id?: string | null
          varasto_varoitus_email?: string | null
          varasto_varoitus_kaytossa?: boolean
        }
        Update: {
          company_id?: string
          created_at?: string
          huolto_valmis_kaytossa?: boolean
          huolto_valmis_pohja?: string
          id?: string
          lasku_eraantynyt_kaytossa?: boolean
          lasku_eraantynyt_paivat?: number
          lasku_eraantynyt_pohja?: string
          testiviesti_email?: string | null
          updated_at?: string
          user_id?: string | null
          varasto_varoitus_email?: string | null
          varasto_varoitus_kaytossa?: boolean
        }
        Relationships: []
      }
      laite_valmistajat: {
        Row: {
          company_id: string
          created_at: string
          id: string
          is_active: boolean
          nimi: string
          order_index: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          nimi: string
          order_index?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          nimi?: string
          order_index?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      laitteet: {
        Row: {
          asiakas_id: string | null
          company_id: string
          created_at: string
          id: string
          malli: string | null
          merkki: string | null
          sarjanumero: string | null
          user_id: string | null
        }
        Insert: {
          asiakas_id?: string | null
          company_id: string
          created_at?: string
          id?: string
          malli?: string | null
          merkki?: string | null
          sarjanumero?: string | null
          user_id?: string | null
        }
        Update: {
          asiakas_id?: string | null
          company_id?: string
          created_at?: string
          id?: string
          malli?: string | null
          merkki?: string | null
          sarjanumero?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      lasku_asetukset: {
        Row: {
          company_id: string
          created_at: string
          id: string
          is_active: boolean
          nimi: string
          oletusmaksuehto_paivat: number
          oletusviivastyskulut: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          nimi: string
          oletusmaksuehto_paivat?: number
          oletusviivastyskulut?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          nimi?: string
          oletusmaksuehto_paivat?: number
          oletusviivastyskulut?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      laskut: {
        Row: {
          alv_prosentti: number | null
          alv_summa: number
          asiakas_alv_numero: string | null
          asiakas_email: string | null
          asiakas_id: string
          asiakas_nimi: string
          asiakas_osoite: string | null
          asiakas_puhelin: string | null
          asiakas_y_tunnus: string | null
          asiakas_yhteyshenkilo: string | null
          company_id: string
          created_at: string
          erapaiva: string
          huolto_id: string | null
          huomautukset: string | null
          id: string
          kokonaissumma: number
          laskun_pvm: string
          maksettu_pvm: string | null
          maksuehto_paivat: number | null
          maksutapa: string | null
          muistutukset_lahetetty: number
          numero: string | null
          rivit: Json
          status: string
          summa_ilman_alvia: number
          tositelaji: string
          updated_at: string
          user_id: string | null
          viivastyskulut: number | null
        }
        Insert: {
          alv_prosentti?: number | null
          alv_summa?: number
          asiakas_alv_numero?: string | null
          asiakas_email?: string | null
          asiakas_id: string
          asiakas_nimi: string
          asiakas_osoite?: string | null
          asiakas_puhelin?: string | null
          asiakas_y_tunnus?: string | null
          asiakas_yhteyshenkilo?: string | null
          company_id: string
          created_at?: string
          erapaiva?: string
          huolto_id?: string | null
          huomautukset?: string | null
          id?: string
          kokonaissumma?: number
          laskun_pvm?: string
          maksettu_pvm?: string | null
          maksuehto_paivat?: number | null
          maksutapa?: string | null
          muistutukset_lahetetty?: number
          numero?: string | null
          rivit?: Json
          status?: string
          summa_ilman_alvia?: number
          tositelaji?: string
          updated_at?: string
          user_id?: string | null
          viivastyskulut?: number | null
        }
        Update: {
          alv_prosentti?: number | null
          alv_summa?: number
          asiakas_alv_numero?: string | null
          asiakas_email?: string | null
          asiakas_id?: string
          asiakas_nimi?: string
          asiakas_osoite?: string | null
          asiakas_puhelin?: string | null
          asiakas_y_tunnus?: string | null
          asiakas_yhteyshenkilo?: string | null
          company_id?: string
          created_at?: string
          erapaiva?: string
          huolto_id?: string | null
          huomautukset?: string | null
          id?: string
          kokonaissumma?: number
          laskun_pvm?: string
          maksettu_pvm?: string | null
          maksuehto_paivat?: number | null
          maksutapa?: string | null
          muistutukset_lahetetty?: number
          numero?: string | null
          rivit?: Json
          status?: string
          summa_ilman_alvia?: number
          tositelaji?: string
          updated_at?: string
          user_id?: string | null
          viivastyskulut?: number | null
        }
        Relationships: []
      }
      licenses: {
        Row: {
          activated_at: string | null
          activated_by: string | null
          company_id: string | null
          created_at: string
          expires_at: string | null
          id: string
          is_used: boolean | null
          license_key: string
          max_users: number | null
          notes: string | null
          plan_type: string | null
        }
        Insert: {
          activated_at?: string | null
          activated_by?: string | null
          company_id?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_used?: boolean | null
          license_key: string
          max_users?: number | null
          notes?: string | null
          plan_type?: string | null
        }
        Update: {
          activated_at?: string | null
          activated_by?: string | null
          company_id?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_used?: boolean | null
          license_key?: string
          max_users?: number | null
          notes?: string | null
          plan_type?: string | null
        }
        Relationships: []
      }
      maksutavat: {
        Row: {
          company_id: string
          created_at: string
          id: string
          is_active: boolean
          nimi: string
          order_index: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          nimi: string
          order_index?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          nimi?: string
          order_index?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      numerointi_asetukset: {
        Row: {
          company_id: string
          created_at: string
          id: string
          is_active: boolean
          numeron_pituus: number
          prefiksi: string
          seuraava_numero: number
          tyyppi: string
          updated_at: string
          user_id: string | null
          vuosi_formaatti: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          numeron_pituus?: number
          prefiksi?: string
          seuraava_numero?: number
          tyyppi: string
          updated_at?: string
          user_id?: string | null
          vuosi_formaatti?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          numeron_pituus?: number
          prefiksi?: string
          seuraava_numero?: number
          tyyppi?: string
          updated_at?: string
          user_id?: string | null
          vuosi_formaatti?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          company_id: string
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      service_statuses: {
        Row: {
          color: string
          company_id: string
          created_at: string
          id: string
          is_active: boolean
          is_default: boolean
          name: string
          order_index: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          color?: string
          company_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_default?: boolean
          name: string
          order_index?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          color?: string
          company_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_default?: boolean
          name?: string
          order_index?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      takuu_asetukset: {
        Row: {
          company_id: string
          created_at: string
          id: string
          is_active: boolean | null
          kuvaus: string | null
          nimi: string
          oletusosatakuu_kuukautta: number | null
          oletustyotakuu_kuukautta: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          kuvaus?: string | null
          nimi: string
          oletusosatakuu_kuukautta?: number | null
          oletustyotakuu_kuukautta?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          kuvaus?: string | null
          nimi?: string
          oletusosatakuu_kuukautta?: number | null
          oletustyotakuu_kuukautta?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      tekniikat: {
        Row: {
          company_id: string
          created_at: string
          id: string
          is_active: boolean
          nimi: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          nimi: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          nimi?: string
          updated_at?: string
          user_id?: string | null
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
      varaosat: {
        Row: {
          company_id: string
          created_at: string
          hinta: number
          id: string
          is_active: boolean
          kategoria: string | null
          kustannushinta: number | null
          kuvaus: string | null
          minimisaldo: number | null
          nimi: string
          saldo: number
          sisaltaa_alv: boolean | null
          toimittaja: string | null
          tuotekoodi: string | null
          updated_at: string
          user_id: string | null
          yksikko: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          hinta?: number
          id?: string
          is_active?: boolean
          kategoria?: string | null
          kustannushinta?: number | null
          kuvaus?: string | null
          minimisaldo?: number | null
          nimi: string
          saldo?: number
          sisaltaa_alv?: boolean | null
          toimittaja?: string | null
          tuotekoodi?: string | null
          updated_at?: string
          user_id?: string | null
          yksikko?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          hinta?: number
          id?: string
          is_active?: boolean
          kategoria?: string | null
          kustannushinta?: number | null
          kuvaus?: string | null
          minimisaldo?: number | null
          nimi?: string
          saldo?: number
          sisaltaa_alv?: boolean | null
          toimittaja?: string | null
          tuotekoodi?: string | null
          updated_at?: string
          user_id?: string | null
          yksikko?: string | null
        }
        Relationships: []
      }
      varasto_asetukset: {
        Row: {
          automaattinen_saldo_vahennys: boolean
          company_id: string
          created_at: string
          id: string
          is_active: boolean
          updated_at: string
          user_id: string | null
          varasto_kaytossa: boolean
          varoita_matalasta_saldosta: boolean
        }
        Insert: {
          automaattinen_saldo_vahennys?: boolean
          company_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id?: string | null
          varasto_kaytossa?: boolean
          varoita_matalasta_saldosta?: boolean
        }
        Update: {
          automaattinen_saldo_vahennys?: boolean
          company_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id?: string | null
          varasto_kaytossa?: boolean
          varoita_matalasta_saldosta?: boolean
        }
        Relationships: []
      }
      yrityksen_asetukset: {
        Row: {
          alv_numero: string | null
          company_id: string
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          logo_url: string | null
          osoite: string | null
          postinumero: string | null
          postitoimipaikka: string | null
          puhelin: string | null
          updated_at: string
          user_id: string | null
          y_tunnus: string | null
          yrityksen_nimi: string
        }
        Insert: {
          alv_numero?: string | null
          company_id: string
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          osoite?: string | null
          postinumero?: string | null
          postitoimipaikka?: string | null
          puhelin?: string | null
          updated_at?: string
          user_id?: string | null
          y_tunnus?: string | null
          yrityksen_nimi: string
        }
        Update: {
          alv_numero?: string | null
          company_id?: string
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          osoite?: string | null
          postinumero?: string | null
          postitoimipaikka?: string | null
          puhelin?: string | null
          updated_at?: string
          user_id?: string | null
          y_tunnus?: string | null
          yrityksen_nimi?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_next_number: { Args: { entity_type: string }; Returns: string }
      get_user_company_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      reduce_part_stock: {
        Args: { part_id: string; quantity: number }
        Returns: undefined
      }
      user_in_same_company: {
        Args: { _user_id_1: string; _user_id_2: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "teknikko" | "kayttaja"
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
      app_role: ["admin", "teknikko", "kayttaja"],
    },
  },
} as const
