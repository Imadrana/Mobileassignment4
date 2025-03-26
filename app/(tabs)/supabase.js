// supabase.js
import { createClient } from '@supabase/supabase-js'

// Replace these values with your actual Supabase project URL and anon key
const supabaseUrl = 'https://peyvurbwqscvvnsrgjyb.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBleXZ1cmJ3cXNjdnZuc3JnanliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5OTY5MjYsImV4cCI6MjA1ODU3MjkyNn0.0ghTwclcPRc9pqyprseWWZ3PZJAQenHS-biLgDTnsHE'

export const supabase = createClient(supabaseUrl, supabaseKey)
