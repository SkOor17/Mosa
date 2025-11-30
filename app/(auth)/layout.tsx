export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    return (
      <div className="py-6 px-4">
          {children}
      </div>
    );
}
