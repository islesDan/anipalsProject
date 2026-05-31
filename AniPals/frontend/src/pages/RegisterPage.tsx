import type { FormEvent } from 'react';
import { useState } from 'react';
import { Button } from '../components/Button';
import { FormField } from '../components/FormField';
import { authService } from '../services/api';
import { localGameService } from '../services/localGame';
import { prepareFreshAccountSession } from '../services/session';
import type { PageId } from '../types/game';

export function RegisterPage({ onNavigate }: { onNavigate: (page: PageId) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');

    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data } = await authService.register(email, password);
      prepareFreshAccountSession(data);
      await localGameService.resetForCurrentAccount();
      onNavigate('create-player');
    } catch {
      setMessage('Registration failed. Try a different email.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <p className="text-sm font-black uppercase tracking-wide text-meadow">New farmer pass</p>
      <h2 className="mt-2 text-4xl font-black text-ink">Register</h2>
      <p className="mt-3 text-sm font-bold text-ink/70">Create your account, then set up your player name.</p>

      <form className="mt-8 grid gap-5" onSubmit={handleSubmit}>
        <FormField
          label="Email"
          type="email"
          placeholder="newfarmer@anipals.test"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <FormField
          label="Password"
          type="password"
          placeholder="Create password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        <FormField
          label="Confirm password"
          type="password"
          placeholder="Repeat password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
        />
        {message && <p className="text-sm font-bold text-red-600">{message}</p>}
        <Button type="submit" className="w-full py-3" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Account'}
        </Button>
      </form>

      <button type="button" className="mt-6 text-sm font-black text-pond hover:text-berry" onClick={() => onNavigate('login')}>
        Already have an account? Log in
      </button>
    </div>
  );
}
