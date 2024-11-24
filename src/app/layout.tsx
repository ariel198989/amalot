import Link from 'next/link'
import { Users } from 'lucide-react'

const Layout = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* תפריט הראשי */}
      <aside className="w-64 bg-white p-6 space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/clients" className="text-blue-500">
            <Users className="h-5 w-5" />
          </Link>
          <span className="text-xl font-semibold">לקוחות</span>
        </div>
        {/* מסך הלקוחות */}
        <nav className="space-y-2">
          {/* קישורים למסכים אחרים */}
        </nav>
      </aside>
      {/* מסך המשתמשים */}
      <main className="flex-1 p-8 space-y-6">
        {/* מסך הלקוחות */}
      </main>
    </div>
  )
}

export default Layout 