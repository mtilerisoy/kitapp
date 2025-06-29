// src/app/read/[bookId]/layout.tsx
// This special layout removes the standard header/sidebar for a focused reading experience.

export default function ReaderLayout({ children }: {
    readonly children: React.ReactNode;
}) {
    return (
        <main className="w-full h-screen bg-white">
            {children}
        </main>
    );
}