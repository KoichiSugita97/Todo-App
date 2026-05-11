// 例: src/pages/api/chat.ts

import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // POSTリクエストの場合の処理
    res.status(200).json({ message: 'POST received!' });
  } else {
    res.status(200).json({ message: 'Hello from GET!' });
  }
}
