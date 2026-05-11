import { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';

export default async function markHasAccount(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'このエンドポイントはPOSTリクエストのみ受け付けます。' });
  }

  // 初回登録完了フラグ Cookie を設定
  res.setHeader(
    'Set-Cookie',
    serialize('hasAccount', 'true', {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1年間有効
    })
  );

  return res.status(200).json({ message: 'hasAccount Cookie を設定しました。' });
}
