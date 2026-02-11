'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useQueries } from '@/hooks/useData'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function CompleteDiagnostic() {
  const { user, session, loading: authLoading } = useAuth()
  const { data: queriesFromHook, isLoading: hookLoading } = useQueries()
  const [directApiData, setDirectApiData] = useState(null)
  const [apiError, setApiError] = useState(null)

  const fetchDirect = async () => {
    try {
      const res = await fetch('/api/queries')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setDirectApiData(data)
    } catch (err) {
      setApiError(err.message)
    }
  }

  useEffect(() => {
    fetchDirect()
  }, [])

  return (
    <div className="min-h-screen p-4 bg-background">
      <div className="max-w-6xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold">Complete System Diagnostic</h1>

        {/* Auth Status */}
        <Card>
          <CardHeader>
            <CardTitle>1. Authentication Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-sm font-mono">
              <p>Loading: {authLoading ? '🔄 TRUE' : '✅ FALSE'}</p>
              <p>User: {user ? `✅ ${user.email} (${user.role})` : '❌ NULL'}</p>
              <p>Session: {session ? '✅ ACTIVE' : '❌ NULL'}</p>
              <p>Super Admin: {user?.is_super_admin ? '✅ YES' : '❌ NO'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Direct API Call */}
        <Card>
          <CardHeader>
            <CardTitle>2. Direct API Call (Bypasses React Hooks)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button onClick={fetchDirect} size="sm">Refetch</Button>
              {apiError && <p className="text-red-500">Error: {apiError}</p>}
              {directApiData && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded">
                  <p className="font-bold text-green-700 dark:text-green-400">
                    ✅ API Returns {directApiData.length} queries
                  </p>
                  <div className="mt-2 max-h-40 overflow-y-auto">
                    {directApiData.slice(0, 5).map((q, i) => (
                      <div key={i} className="text-xs p-2 bg-white dark:bg-slate-800 rounded mt-1">
                        {q.queryId}: {q.customerName} → {q.destination || 'N/A'}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* useQueries Hook */}
        <Card>
          <CardHeader>
            <CardTitle>3. useQueries() Hook (Via DataContext)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="space-y-1 text-sm font-mono">
                <p>Hook Loading: {hookLoading ? '🔄 TRUE' : '✅ FALSE'}</p>
                <p>Data Type: {Array.isArray(queriesFromHook) ? 'ARRAY' : typeof queriesFromHook}</p>
                <p>Data Length: {queriesFromHook ? queriesFromHook.length : 'NULL/UNDEFINED'}</p>
              </div>
              
              {queriesFromHook && queriesFromHook.length > 0 ? (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded">
                  <p className="font-bold text-green-700 dark:text-green-400">
                    ✅ Hook Returns {queriesFromHook.length} queries
                  </p>
                  <div className="mt-2 max-h-40 overflow-y-auto">
                    {queriesFromHook.slice(0, 5).map((q, i) => (
                      <div key={i} className="text-xs p-2 bg-white dark:bg-slate-800 rounded mt-1">
                        {q.queryId}: {q.customerName} → {q.destination || 'N/A'}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded">
                  <p className="font-bold text-red-700 dark:text-red-400">
                    ❌ Hook Returns EMPTY or NO DATA
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>4. Diagnosis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {!user && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                  <p className="font-bold">⚠️ NOT LOGGED IN</p>
                  <p>You need to login first. Go to <a href="/" className="underline text-blue-600">login page</a></p>
                </div>
              )}
              
              {directApiData && queriesFromHook && directApiData.length !== queriesFromHook.length && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded">
                  <p className="font-bold text-red-700">❌ MISMATCH DETECTED!</p>
                  <p>Direct API: {directApiData.length} items</p>
                  <p>React Hook: {queriesFromHook.length} items</p>
                  <p className="mt-2 text-xs">This means DataContext is not fetching properly!</p>
                </div>
              )}

              {directApiData && queriesFromHook && directApiData.length === queriesFromHook.length && queriesFromHook.length > 0 && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded">
                  <p className="font-bold text-green-700">✅ EVERYTHING WORKING!</p>
                  <p>Both API and Hook return {queriesFromHook.length} queries</p>
                  <p className="mt-2">If you still don't see data on /queries page, the issue is in the UI rendering logic.</p>
                </div>
              )}

              {hookLoading && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-bold">🔄 Hook is loading...</p>
                  <p>Wait a moment and it should populate</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Browser Console Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>5. Check Browser Console</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Press <kbd className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded">F12</kbd> to open Developer Tools.
              Look for console logs starting with <code className="px-1 bg-slate-200 dark:bg-slate-700 rounded">[DataContext]</code>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
