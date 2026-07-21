import { redirect } from 'next/navigation';

export default function AccountRedirect() {
  return redirect('/settings');
}
