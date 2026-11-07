'use client';

import ErrorPage, { type ErrorPageProps } from '@/components/pages/error';

export default function Page({ error, reset }: ErrorPageProps) {
  return <ErrorPage error={error} reset={reset} />;
}
