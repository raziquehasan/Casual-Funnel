// Demo pages get their own layout WITHOUT the analytics sidebar
export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
