'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function SimpleTestPage() {
  const [queries, setQueries] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchDirectly = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log('Fetching from /api/queries...')
      const res = await fetch('/api/queries')
      console.log('Response status:', res.status)
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }
      
      const data = await res.json()
      console.log('Got data:', data.length, 'queries')
      setQueries(data)
    } catch (err) {
      console.error('Error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Auto-fetch on mount
  useEffect(() => {
    fetchDirectly()
  }, [])

  return (
    <div className="min-h-screen p-8 bg-background">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Simple Direct API Test</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Direct API Call (No Auth Context)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={fetchDirectly} disabled={loading}>
              {loading ? 'Fetching...' : 'Fetch Queries'}
            </Button>

            {error && (
              <div className="p-4 bg-red-100 dark:bg-red-900 rounded">
                <strong>Error:</strong> {error}
              </div>
            )}

            {queries && (
              <div>
                <p className="text-xl font-bold mb-4">
                  ✅ SUCCESS! Found {queries.length} queries
                </p>
                
                <div className="space-y-2 max-h-96 overflow-y-auto border rounded p-4">
                  {queries.map((q, i) => (
                    <div key={i} className="p-3 bg-muted rounded">
                      <p className="font-bold">{q.queryId || 'No ID'}: {q.customerName || 'No Name'}</p>
                      <p className="text-sm">
                        Destination: {q.destination || 'N/A'} | 
                        Status: {q.status || 'N/A'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
