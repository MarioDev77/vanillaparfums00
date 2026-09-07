import { redirect } from 'next/navigation'
import { backendFetch } from '@/lib/admin-server'
import AdminDashboard from './dashboard'

export default async function AdminPage() {
  const session = await backendFetch('/auth/me')
  if (!session.ok) redirect('/admin/login')
  const data = await session.json()
  return <AdminDashboard userName={data.user.name} />
}
