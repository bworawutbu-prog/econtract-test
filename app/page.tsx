import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect handled by next.config, but this provides fallback
  redirect('/login');
}
