'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function DebugPage() {
  const { user, session, loading } = useAuth()
  const [queries, setQueries] = useState([])
  const [apiError, setApiError] = useState(null)
  const [fetching, setFetching] = useState(false)

  const fetchQueries = async () => {
    setFetching(true)
    setApiError(null)
    try {
      const response = await fetch('/api/queries', {
        headers: session?.access_token ? {
          'Authorization': `Bearer ${session.access_token}`
        } : {}
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      setQueries(data)
    } catch (error) {
      setApiError(error.message)
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => {
    if (user && session) {
      fetchQueries()
    }
  }, [user, session])

  return (
    <div className="min-h-screen p-8 bg-background">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Debug & Data Check</h1>

        <Card>
          <CardHeader>
            <CardTitle>Authentication Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Loading:</strong> {loading ? '✓ Yes' : '✗ No'}</p>
            <p><strong>User:</strong> {user ? `✓ ${user.email}` : '✗ Not logged in'}</p>
            <p><strong>Session:</strong> {session ? '✓ Active' : '✗ No session'}</p>
            {user && (
              <>
                <p><strong>User ID:</strong> {user.id}</p>
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Role:</strong> {user.role}</p>
                <p><strong>Super Admin:</strong> {user.is_super_admin ? 'Yes' : 'No'}</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Data Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={fetchQueries} disabled={fetching}>
                {fetching ? 'Fetching...' : 'Fetch Queries'}
              </Button>
            </div>
            
            {apiError && (
              <div className="p-4 bg-red-100 dark:bg-red-900 rounded text-red-800 dark:text-red-100">
                <strong>Error:</strong> {apiError}
              </div>
            )}
            
            {queries.length > 0 && (
              <div>
                <p className="text-lg font-semibold mb-2">
                  ✓ Found {queries.length} Queries
                </p>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {queries.slice(0, 10).map((query) => (
                    <div key={query.id} className="p-3 bg-muted rounded">
                      <p className="font-medium">{query.queryId}: {query.customerName}</p>
                      <p className="text-sm text-muted-foreground">
                        Destination: {query.destination || 'N/A'} | 
                        Travel: {query.travelDate || 'TBD'} | 
                        Status: {query.status}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {!loading && !user && (
              <div className="p-4 bg-yellow-100 dark:bg-yellow-900 rounded">
                <p className="font-semibold">⚠️ Not Logged In</p>
                <p className="text-sm mt-1">Please log in to see data</p>
                <Button className="mt-2" onClick={() => window.location.href = '/'}>
                  Go to Login
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Direct API Test (No Auth)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">
              Testing API without authentication:
            </p>
            <pre className="bg-muted p-4 rounded text-xs overflow-x-auto">
              curl http://localhost:3000/api/queries
            </pre>
            <Button 
              className="mt-2" 
              onClick={async () => {
                const res = await fetch('/api/queries')
                const data = await res.json()
                alert(`API returned ${data.length} queries without auth`)
              }}
            >
              Test API
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
