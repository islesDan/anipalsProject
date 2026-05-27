import { Button } from '../components/Button';
import { FormField } from '../components/FormField';
import type { PageId } from '../types/game';

export function LoginPage({ onNavigate }: { onNavigate: (page: PageId) => void }) {
  return (
    <div className="mx-auto flex max-w-md flex-col justify-center">
      <p className="text-sm font-black uppercase tracking-wide text-berry">AniPals account</p>
      <h2 className="mt-2 text-4xl font-black text-ink">Log in</h2>
      <p className="mt-3 text-sm font-bold text-ink/70">Return to your farm, check requests, and collect daily rewards.</p>

      <form className="mt-8 grid gap-5" onSubmit={(event) => event.preventDefault()}>
        <FormField label="Email" type="email" placeholder="farmer@anipals.test" />
        <FormField label="Password" type="password" placeholder="Enter password" />
        <Button type="button" className="w-full py-3" onClick={() => onNavigate('dashboard')}>
          Enter Farm
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
