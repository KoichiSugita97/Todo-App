import fetch from 'node-fetch';
import { spawn, ChildProcess } from 'child_process';

const PORT = process.env.PORT ?? '3000';
const BASE_URL = `http://localhost:${PORT}`;

function startServer(): ChildProcess {
  const proc = spawn('npm', ['run', 'dev'], {
    shell: true,
    stdio: 'inherit',
    env: { ...process.env, PORT },
  });
  return proc;
}

async function waitForServer(retries = 30, interval = 1000): Promise<void> {
  let count = 0;
  while (count < retries) {
    try {
      const res = await fetch(`${BASE_URL}/api/health`);
      if (res.ok) return;
    } catch {
      // ignore
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
    count++;
  }
  throw new Error('Server did not start within timeout');
}

async function testTodos(): Promise<void> {
  // 1. サインアップ（重複時はログイン）してクッキーを取得
  let cookie = '';
  const signupRes = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'testuser@example.com', password: 'testpassword' }),
  });
  if (signupRes.ok) {
    cookie = signupRes.headers.get('set-cookie')?.split(';')[0] || '';
    console.log('Signup response:', await signupRes.json());
  } else if (signupRes.status === 409) {
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'testuser@example.com', password: 'testpassword' }),
    });
    if (!loginRes.ok) throw new Error(`Login failed: ${loginRes.status}`);
    cookie = loginRes.headers.get('set-cookie')?.split(';')[0] || '';
    console.log('Login response:', await loginRes.json());
  } else {
    throw new Error(`Signup failed: ${signupRes.status}`);
  }
  if (!cookie) throw new Error('認証用クッキーの取得に失敗しました。');

  // 2. POST: 新しいToDoを作成
  const postRes = await fetch(`${BASE_URL}/api/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({ title: 'テストToDo', description: 'fetch APIでのテスト' }),
  });
  const createdTodo = await postRes.json();
  console.log('Created Todo:', createdTodo);

  // 3. GET: 作成済みToDo一覧を取得
  const getRes = await fetch(`${BASE_URL}/api/todos`, {
    headers: { Cookie: cookie },
  });
  const todosList = await getRes.json();
  console.log('Todos List:', todosList);
}

async function main() {
  const server = startServer();
  try {
    console.log('Waiting for server to start...');
    await waitForServer();
    console.log('Server is up. Running tests...');
    await testTodos();
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  } finally {
    console.log('Stopping server...');
    server.kill();
  }
}

main();
