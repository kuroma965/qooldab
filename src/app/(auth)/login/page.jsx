// app/login/page.js
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <main>
        <LoginForm redirectTo="/profile" />
    </main>
  );
}
