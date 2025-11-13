import { Sidebar } from "./sidebar";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container py-8 md:py-12 px-4">
      <div className="flex flex-col md:flex-row gap-8">
        <Sidebar />
        <div className="flex-grow">{children}</div>
      </div>
    </div>
  );
}
