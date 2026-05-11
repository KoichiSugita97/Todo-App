import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import prisma from '../../../lib/db';
import { serialize } from 'cookie';

export default async function login(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'このエンドポイントはPOSTリクエストのみ受け付けます。' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'メールアドレスとパスワードは必須です。' });
  }

  try {
    // ユーザーを取得
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: 'メールアドレスまたはパスワードが正しくありません。' });
    }

    // パスワードを比較
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'メールアドレスまたはパスワードが正しくありません。' });
    }

    // 簡易的なセッション管理（例: クッキーにユーザー情報を保存）
    // 実際のアプリケーションでは、セッション管理ライブラリを使用することを推奨します。
    res.setHeader('Set-Cookie', serialize('userId', String(user.id), { path: '/', httpOnly: true }));

    return res.status(200).json({ message: 'ログインに成功しました。' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'サーバーエラーが発生しました。' });
  }
}
