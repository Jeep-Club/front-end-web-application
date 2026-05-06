export default function RegisterLayout({ children }: { children: React.ReactNode }) {
    const registerTheme = {
        '--text-secundary': 'var(--text-secondary)',
        '--button-active': 'var(--button-secondary-bg)',
        '--button-hover': 'var(--button-secondary-bg-hover)',
        '--button-text': 'var(--button-secondary-text)',
        '--input-disabled': 'var(--input-bg-disabled)',
        '--r-md': '0.5rem',
    } as React.CSSProperties;

    return (
        <main className="min-h-screen bg-[#0e0e0e] text-white" style={registerTheme}>
            {/* conteudo da pagina de registro*/}
            {/* Janaina*/}
            {children}
        </main>
    );
}
