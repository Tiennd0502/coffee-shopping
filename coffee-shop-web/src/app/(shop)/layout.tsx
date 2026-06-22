import Header from '@/layouts/Header'
import Footer from '@/layouts/Footer'

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 w-full min-w-0">{children}</main>
      <Footer />
    </div>
  )
}
