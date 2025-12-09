// app/signup/page.js
import SignupForm from '@/components/auth/SignupForm';

export default function SignupPage() {
  return (
    <main>
        <SignupForm redirectTo="/profile" />
    </main>
  );
}
