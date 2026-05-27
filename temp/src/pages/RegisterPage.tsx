import { Button } from '../components/Button';
import { FormField } from '../components/FormField';
import type { PageId } from '../types/game';

export function RegisterPage({ onNavigate }: { onNavigate: (page: PageId) => void }) {
  return (
    <div className="mx-auto max-w-md">
      <p className="text-sm font-black uppercase tracking-wide text-meadow">New farmer pass</p>
      <h2 className="mt-2 text-4xl font-black text-ink">Register</h2>
      <p className="mt-3 text-sm font-bold text-ink/70">Mock form only. The API service is ready for real auth later.</p>

      <form className="mt-8 grid gap-5" onSubmit={(event) => event.preventDefault()}>
        <FormField label="Email" type="email" placeholder="newfarmer@anipals.test" />
        <FormField label="Password" type="password" placeholder="Create password" />
        <FormField label="Confirm password" type="password" placeholder="Repeat password" />
        <Button type="button" className="w-full py-3" onClick={() => onNavigate('create-player')}>
          Create Account
        </Button>
      </form>

      <button type="button" className="mt-6 text-sm font-black text-pond hover:text-berry" onClick={() => onNavigate('login')}>
        Already have an account? Log in
      </button>
    </div>
  );
}
