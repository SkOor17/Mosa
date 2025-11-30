import HeaderApp from "@/src/components/ui/header";

export default function SummaryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <HeaderApp/>
      {children}
    </div>
  );
}
