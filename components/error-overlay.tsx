"use client"
import { useEffect, useState } from "react"

export function ErrorOverlay() {
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      setErrors(prev => [...prev, `[ERROR]: ${event.message} at ${event.filename}:${event.lineno}`])
    }
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      setErrors(prev => [...prev, `[UNHANDLED PROMISE]: ${String(event.reason)}`])
    }
    
    const originalConsoleError = console.error
    console.error = (...args) => {
      setErrors(prev => [...prev, `[CONSOLE.ERROR]: ${args.map(a => String(a)).join(" ")}`])
      originalConsoleError.apply(console, args)
    }

    window.addEventListener("error", handleGlobalError)
    window.addEventListener("unhandledrejection", handleUnhandledRejection)

    return () => {
      window.removeEventListener("error", handleGlobalError)
      window.removeEventListener("unhandledrejection", handleUnhandledRejection)
      console.error = originalConsoleError
    }
  }, [])

  if (errors.length === 0) return null

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 999999, 
      background: 'rgba(255,0,0,0.9)', color: 'white', padding: '20px', 
      maxHeight: '50vh', overflow: 'auto', fontFamily: 'monospace', fontSize: '14px'
    }}>
      <h2 style={{fontWeight: 'bold', fontSize: '18px', marginBottom: '10px'}}>ОШИБКИ В БРАУЗЕРЕ (Пожалуйста, отправь скриншот этого окна):</h2>
      <button onClick={() => setErrors([])} style={{background: 'white', color: 'black', padding: '5px 10px', marginBottom: '10px', borderRadius: '5px'}}>Очистить</button>
      {errors.map((err, i) => (
        <div key={i} style={{marginBottom: '5px', paddingBottom: '5px', borderBottom: '1px solid rgba(255,255,255,0.3)'}}>
          {err}
        </div>
      ))}
    </div>
  )
}
