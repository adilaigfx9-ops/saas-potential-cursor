import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface ApiTestResult {
  endpoint: string;
  status: 'success' | 'error' | 'loading';
  response?: any;
  error?: string;
  duration?: number;
}

export function ApiTest() {
  const [results, setResults] = useState<ApiTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const endpoints = [
    { name: 'API Status', url: '/api/test.php', method: 'GET' },
    { name: 'Global Settings', url: '/api/settings.php', method: 'GET' },
    { name: 'Blogs', url: '/api/blogs.php', method: 'GET' },
    { name: 'Portfolio', url: '/api/portfolio.php', method: 'GET' },
    { name: 'Services', url: '/api/services.php', method: 'GET' },
    { name: 'Testimonials', url: '/api/testimonials.php', method: 'GET' },
    { name: 'FAQs', url: '/api/faqs.php', method: 'GET' },
    { name: 'Homepage Content', url: '/api/homepage.php', method: 'GET' },
  ];

  const testEndpoint = async (endpoint: typeof endpoints[0]) => {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`/backend${endpoint.url}`, {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const duration = Date.now() - startTime;
      const data = await response.json();

      return {
        endpoint: endpoint.name,
        status: response.ok ? 'success' : 'error',
        response: data,
        duration,
        error: response.ok ? undefined : `HTTP ${response.status}: ${data.message || 'Unknown error'}`,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        endpoint: endpoint.name,
        status: 'error',
        error: error instanceof Error ? error.message : 'Network error',
        duration,
      };
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setResults([]);

    for (const endpoint of endpoints) {
      setResults(prev => [...prev, {
        endpoint: endpoint.name,
        status: 'loading',
      }]);

      const result = await testEndpoint(endpoint);
      
      setResults(prev => prev.map(r => 
        r.endpoint === endpoint.name ? result : r
      ));
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: ApiTestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'loading':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
    }
  };

  const getStatusBadge = (status: ApiTestResult['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-500">Success</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'loading':
        return <Badge variant="secondary">Loading...</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>API Endpoint Testing</CardTitle>
          <CardDescription>
            Test all backend API endpoints to verify connectivity and functionality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              onClick={runAllTests} 
              disabled={isRunning}
              className="w-full"
            >
              {isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Running Tests...
                </>
              ) : (
                'Run All API Tests'
              )}
            </Button>

            {results.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Test Results</h3>
                {results.map((result, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(result.status)}
                        <span className="font-medium">{result.endpoint}</span>
                        {getStatusBadge(result.status)}
                      </div>
                      {result.duration && (
                        <span className="text-sm text-muted-foreground">
                          {result.duration}ms
                        </span>
                      )}
                    </div>
                    
                    {result.error && (
                      <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-sm text-red-600 dark:text-red-400">
                        {result.error}
                      </div>
                    )}
                    
                    {result.response && result.status === 'success' && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                          View Response
                        </summary>
                        <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                          {JSON.stringify(result.response, null, 2)}
                        </pre>
                      </details>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
