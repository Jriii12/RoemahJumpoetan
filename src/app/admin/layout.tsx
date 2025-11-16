export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // You can add a sidebar, header, or any other shared layout for the admin section here.
  // This layout can also be used to protect admin routes.
  return <div className="bg-background text-foreground">{children}</div>;
}
