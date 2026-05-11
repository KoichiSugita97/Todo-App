
import { useState } from 'react';
import type { GetServerSideProps } from 'next';
import TodoForm from '../components/TodoForm';

export default function TodosPage() {
  const [todos, setTodos] = useState<string[]>([]);

  const handleAdd = (title: string) => {
    setTodos([...todos, title]);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
      <h1>あなたのToDo一覧</h1>
      <TodoForm onAdd={handleAdd} />
      {todos.length === 0 ? (
        <p>現在登録されているToDoはありません。</p>
      ) : (
        <ul>
          {todos.map((todo, index) => (
            <li key={index}>{todo}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  return { props: {} };
};
