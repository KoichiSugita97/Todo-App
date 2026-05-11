import { GetServerSideProps, NextPage } from 'next';
import prisma from '../lib/db';
import React, { useState } from 'react';
import TodoForm from '../components/TodoForm';

type Todo = {
  id: number;
  title: string;
  description: string | null;
  createdAt: string;
  completed: boolean;
};

type Props = {
  todos: Todo[];
};

export const getServerSideProps: GetServerSideProps<Props> = async ({ req, query }) => {
  const userIdCookie = req.cookies.userId;
  const userId = userIdCookie ? parseInt(userIdCookie, 10) : null;
  if (!userId) {
    const force = typeof query.force === 'string' ? query.force : undefined;
    if (force === 'signup') {
      return { redirect: { destination: '/signup', permanent: false } };
    }
    if (force === 'login') {
      return { redirect: { destination: '/login', permanent: false } };
    }
    return { redirect: { destination: '/signup', permanent: false } };
  }

  const todos = await prisma.todo.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
  const serialized = todos.map((todo) => ({
    id: todo.id,
    title: todo.title,
    description: todo.description,
    createdAt: todo.createdAt.toISOString(),
    completed: todo.completed,
  }));
  return { props: { todos: serialized } };
};

const HomePage: NextPage<Props> = ({ todos: initialTodos }) => {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);

  const handleAdd = async (title: string) => {
    try {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error('ToDoの追加に失敗しました。');
      const newTodo: Todo = await res.json();
      setTodos((prev) => [newTodo, ...prev]);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'エラーが発生しました。');
    }
  };

  const handleUpdate = async (todo: Todo) => {
    const title = prompt('新しいタイトルを入力してください', todo.title);
    if (title === null) return;
    try {
      const res = await fetch(`/api/todos/${todo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error('更新に失敗しました。');
      const updated: Todo = await res.json();
      setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'エラーが発生しました。');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('本当に削除しますか？')) return;
    try {
      const res = await fetch(`/api/todos/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('削除に失敗しました。');
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'エラーが発生しました。');
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto' }}>
      <h1>あなたのToDo一覧</h1>
      <TodoForm onAdd={handleAdd} />
      {todos.length === 0 ? (
        <p>現在登録されているToDoはありません。</p>
      ) : (
        <ul>
          {todos.map((todo) => (
            <li key={todo.id} style={{ marginBottom: '1rem' }}>
              <h2>{todo.title}</h2>
              <p>{todo.description}</p>
              <small>
                作成: {new Date(todo.createdAt).toLocaleString()}
                {todo.completed && <span> / 完了済み</span>}
              </small>
              <div style={{ marginTop: 8 }}>
                <button onClick={() => handleUpdate(todo)} style={{ marginRight: 8 }}>
                  編集
                </button>
                <button onClick={() => handleDelete(todo.id)}>削除</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default HomePage;
