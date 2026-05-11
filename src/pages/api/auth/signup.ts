import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import prisma from '../../../lib/db';
import { serialize } from 'cookie';

export default async function signup(req: NextApiRequest, res: NextApiResponse) {
  console.log('signup API called', { method: req.method, url: req.url, body: req.body });
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'このエンドポイントはPOSTリクエストのみ受け付けます。' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'メールアドレスとパスワードは必須です。' });
  }

  try {
    // 既に同じメールアドレスのユーザーが存在するか確認
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ error: 'このメールアドレスは既に登録されています。' });
    }

    // パスワードをハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10);

    // 新規ユーザーを作成
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });
    // 登録直後に userId と hasAccount の 2 つのクッキーを同時に設定
    const userIdCookie = serialize('userId', String(newUser.id), { path: '/', httpOnly: true });
    const hasAccountCookie = serialize('hasAccount', 'true', {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1年間有効
    });
    res.setHeader('Set-Cookie', [userIdCookie, hasAccountCookie]);

    // 簡易的なセッション管理（例: クッキーにユーザー情報を保存）
    // 実際のアプリケーションでは、セッション管理ライブラリを使用することを推奨します。

    return res.status(201).json({ message: 'ユーザー登録が成功しました。' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'サーバーエラーが発生しました。' });
  }
}
