export default function AuthLayout({ children }: {
    readonly children: React.ReactNode;
  }) {
    return (
      <div className="flex-col items-center justify-center min-h-screen dark:bg-gray-1000">
        {children}
      </div>
    );
  }