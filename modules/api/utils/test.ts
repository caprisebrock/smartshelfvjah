// COPY THIS ENTIRE FILE FROM: pages/api/test.ts
// pages/api/test.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../database/config/databaseConfig'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { data, error } = await supabase.from('sessions').select('*').limit(1)

  if (error) return res.status(500).json({ error: error.message })
  res.status(200).json({ data })
} 