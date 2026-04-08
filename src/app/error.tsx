'use client' // Error boundaries must be Client Components
 
import { useEffect } from 'react'
 
export default function Error({
  error,
}: {
  error: Error & { digest?: string }
}) {


    function handleClick() {
        window.location.reload();
    }
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center gap-8">
            <h1 className="text-4xl font-bold">Algo deu errado!</h1>
            <button onClick={handleClick} className="button">Tentar Novamente</button>
        </div>
  )
}