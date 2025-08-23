// COPY THIS ENTIRE FILE FROM: pages/api/ping.ts
import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('🏓 Ping endpoint hit');
  console.log('📝 Request method:', req.method);
  console.log('📦 Request body:', req.body);
  
  res.status(200).json({ 
    message: 'pong',
    timestamp: new Date().toISOString(),
    method: req.method
  });
} 