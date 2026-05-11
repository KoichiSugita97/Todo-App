import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userIdCookie = req.cookies.userId;
  const userId = userIdCookie ? parseInt(userIdCookie, 10) : null;
  if (!userId) {
    return res.status(401).json({ error: '認証が必要です。' });
  }

  if (req.method === 'GET') {
    try {
      const todos = await prisma.todo.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      return res.status(200).json(todos);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'サーバーエラーが発生しました。' });
    }
  } else if (req.method === 'POST') {
    const { title, description } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'タイトルは必須です。' });
    }
    try {
      const newTodo = await prisma.todo.create({
        data: {
          title,
          description: description || '',
          user: { connect: { id: userId } },
        },
      });
      return res.status(201).json(newTodo);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'サーバーエラーが発生しました。' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
