import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userIdCookie = req.cookies.userId;
  const userId = userIdCookie ? parseInt(userIdCookie, 10) : null;
  if (!userId) {
    return res.status(401).json({ error: '認証が必要です。' });
  }

  const { id } = req.query;
  const todoId = Array.isArray(id) ? parseInt(id[0], 10) : parseInt(id as string, 10);
  if (isNaN(todoId)) {
    return res.status(400).json({ error: '無効なIDです。' });
  }

  // 所有チェック
  const todo = await prisma.todo.findUnique({ where: { id: todoId } });
  if (!todo || todo.userId !== userId) {
    return res.status(404).json({ error: 'ToDoが見つかりません。' });
  }

  if (req.method === 'PUT') {
    const { title, description, completed } = req.body;
    try {
      const updatedTodo = await prisma.todo.update({
        where: { id: todoId },
        data: {
          title: title !== undefined ? title : todo.title,
          description: description !== undefined ? description : todo.description,
          completed: completed !== undefined ? completed : todo.completed,
        },
      });
      return res.status(200).json(updatedTodo);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'サーバーエラーが発生しました。' });
    }
  } else if (req.method === 'DELETE') {
    try {
      await prisma.todo.delete({ where: { id: todoId } });
      return res.status(204).end();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'サーバーエラーが発生しました。' });
    }
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
