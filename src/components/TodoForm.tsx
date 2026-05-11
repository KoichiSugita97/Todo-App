import { useState } from 'react';

export default function TodoForm({ onAdd }: { onAdd: (title: string) => void }) {
  const [title, setTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(title.trim());
    setTitle('');
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
      <input
        type="text"
        placeholder="新しいToDoを入力"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ padding: '0.5rem', width: '70%' }}
      />
      <button type="submit" style={{ padding: '0.5rem' }}>
        追加
      </button>
    </form>
  );
}
