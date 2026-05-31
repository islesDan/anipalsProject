import type { FormEvent } from 'react';
import { useState } from 'react';
import { Button } from '../components/Button';
import { FormField } from '../components/FormField';
import { authService } from '../services/api';
import { localGameService } from '../services/localGame';
import { prepareFreshAccountSession } from '../services/session';
import type { PageId } from '../types/game';

export function LoginPage({ onNavigate }: { onNavigate: (page: PageId) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setIsSubmitting(true);

    try {
      const { data } = await authService.login(email, password);
      prepareFreshAccountSession(data);
      await localGameService.state();
      onNavigate(data.tutorialCompleted ? 'dashboard' : 'tutorial');
    } catch {
      setMessage('Login failed. Check your email and password.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col justify-center">
      <p className="text-sm font-black uppercase tracking-wide text-berry">AniPals account</p>
      <h2 className="mt-2 text-4xl font-black text-ink">Log in</h2>
      <p className="mt-3 text-sm font-bold text-ink/70">Return to your farm, check requests, and continue your cozy harvest loop.</p>

      <form className="mt-8 grid gap-5" onSubmit={handleSubmit}>
        <FormField
          label="Email"
          type="email"
          placeholder="farmer@anipals.test"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <FormField
          label="Password"
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        {message && <p className="text-sm font-bold text-red-600">{message}</p>}
        <Button type="submit" className="w-full py-3" disabled={isSubmitting}>
          {isSubmitting ? 'Entering...' : 'Enter Farm'}
        </Button>
      </form>

      <div className="mt-6 grid gap-3 text-sm font-bold">
        <button type="button" className="text-left text-pond hover:text-berry" onClick={() => onNavigate('register')}>
          Create a new account
        </button>
        <button type="button" className="text-left text-pond hover:text-berry" onClick={() => onNavigate('create-player')}>
          Continue to player name setup
        </button>
      </div>
    </div>
  );
}
