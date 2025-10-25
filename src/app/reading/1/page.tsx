import { redirect } from 'next/navigation';

export default function ReadingPage() {
  // Redirect old route to new dynamic route
  redirect('/reading/17/test-1/1');
}
