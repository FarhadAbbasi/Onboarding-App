import React, { useState } from 'react';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import toast from 'react-hot-toast';

export const OpenAITest: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const testConnection = async () => {
    if (!apiKey.trim()) {
      toast.error('Please enter your API key');
      return;
    }

    setTesting(true);
    setResult(null);

    try {
      console.log('Testing OpenAI connection...');
      
      // Test basic connection with a simple request
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('OpenAI API Error:', response.status, errorData);
        
        if (response.status === 401) {
          throw new Error('Invalid API key. Please check your OpenAI API key.');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait and try again.');
        } else {
          throw new Error(`API error: ${response.status} - ${errorData}`);
        }
      }

      const data = await response.json();
      console.log('Available models:', data);
      
      // Check if GPT-4o is available
      const hasGPT4o = data.data?.some((model: any) => model.id === 'gpt-4o');
      const hasGPT4 = data.data?.some((model: any) => model.id === 'gpt-4');
      const hasGPT35 = data.data?.some((model: any) => model.id === 'gpt-3.5-turbo');
      
      setResult(`✅ Connection successful!
      
Available models:
${hasGPT4o ? '✅ GPT-4o (preferred)' : '❌ GPT-4o (not available)'}
${hasGPT4 ? '✅ GPT-4' : '❌ GPT-4'}
${hasGPT35 ? '✅ GPT-3.5-turbo' : '❌ GPT-3.5-turbo'}

Total models: ${data.data?.length || 0}`);
      
      toast.success('OpenAI connection successful!');
      
    } catch (error) {
      console.error('OpenAI test error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setResult(`❌ Connection failed: ${errorMessage}`);
      toast.error(errorMessage);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-2xl mx-auto">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">OpenAI API Test</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            OpenAI API Key
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="sk-..."
          />
        </div>

        <button
          onClick={testConnection}
          disabled={testing || !apiKey.trim()}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {testing ? (
            <>
              <LoadingSpinner size="sm" />
              Testing Connection...
            </>
          ) : (
            'Test OpenAI Connection'
          )}
        </button>

        {result && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <pre className="text-sm whitespace-pre-wrap text-gray-800">{result}</pre>
          </div>
        )}
      </div>
    </div>
  );
}; 