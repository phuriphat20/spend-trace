'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AddExpense() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'Food & Beverage', 
    date: new Date().toISOString().split('T')[0],
    note: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.from('expenses').insert([
      {
        title: formData.title,
        amount: parseFloat(formData.amount),
        category: formData.category,
        date: formData.date,
        note: formData.note
      }
    ])

    if (error) {
      alert('Error: ' + error.message)
    } else {
      router.push('/')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <main className="max-w-md mx-auto p-6">
      {/* Header with Back Button */}
      <header className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
          type="button"
          aria-label="Go back"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <h1 className="text-2xl font-bold">Add New Expense</h1>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Description</label>
          <input 
            type="text" required
            placeholder="e.g., Lunch"
            className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900"
            onChange={(e) => setFormData({...formData, title: e.target.value})}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Amount (฿)</label>
            <input 
              type="number" required step="1.00"
              placeholder="0.00"
              className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900"
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
            />
          </div>
          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900">Category</label>
            <select 
              className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900 cursor-pointer"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            >
              <option value="Food & Beverage">Food & Beverage</option>
              <option value="Transportation">Transportation</option>
              <option value="Housing">Housing</option>
              <option value="Shopping">Shopping</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Others">Others</option>
            </select>
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Date</label>
          <div className="relative">
            <input 
              type="date" required
              value={formData.date}
              className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900 cursor-pointer block appearance-none"
              onChange={(e) => setFormData({...formData, date: e.target.value})}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
            </div>
          </div>
        </div>

        {/* Note (Optional) */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Note (Optional)</label>
          <textarea 
            rows={2}
            placeholder="Add more details..."
            className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900 resize-none"
            onChange={(e) => setFormData({...formData, note: e.target.value})}
          />
        </div>

        <div className="pt-4">
          <button 
            type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white p-3.5 rounded-xl font-bold hover:bg-blue-700 disabled:bg-gray-400 shadow-lg active:scale-[0.98] transition-all"
          >
            {loading ? 'Saving...' : 'Save Transaction'}
          </button>
        </div>
      </form>
    </main>
  )
}