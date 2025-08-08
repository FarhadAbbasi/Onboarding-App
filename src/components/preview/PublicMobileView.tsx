import React, { useState, useEffect } from 'react';
import { MobileFrame } from '../ui/MobileFrame';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { supabase } from '../../lib/supabase';
import type { UIFlow, UIScreen } from '../../types/ui-schema';

interface PublicMobileViewProps {
  projectId: string;
}

export const PublicMobileView: React.FC<PublicMobileViewProps> = ({ projectId }) => {
  const [flow, setFlow] = useState<UIFlow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPublicFlow = async () => {
      if (!projectId) {
        setError('Project ID not found');
        setLoading(false);
        return;
      }

      try {
        console.log('🔍 Loading public flow for project:', projectId);

        // Fetch onboarding pages for this project
        const { data: pages, error: pagesError } = await supabase
          .from('onboarding_pages')
          .select('*')
          .eq('project_id', projectId)
          .order('order_index');

        if (pagesError) {
          console.error('❌ Error loading pages:', pagesError);
          setError('Failed to load project');
          setLoading(false);
          return;
        }

        if (!pages || pages.length === 0) {
          setError('No screens found for this project');
          setLoading(false);
          return;
        }

        console.log('📱 Loaded pages:', pages);

        // Parse the first page to get the theme and reconstruct the flow
        const firstPage = pages[0];
        let theme;
        try {
          theme = JSON.parse(firstPage.theme);
        } catch (e) {
          console.error('❌ Error parsing theme:', e);
          theme = {
            primaryColor: '#3B82F6',
            secondaryColor: '#10B981',
            backgroundColor: '#FFFFFF',
            textColor: '#1F2937'
          };
        }

        // Convert pages to screens
        const screens: UIScreen[] = pages.map(page => {
          try {
            return JSON.parse(page.html_content);
          } catch (e) {
            console.error('❌ Error parsing screen content:', e);
            return {
              id: page.page_id,
              name: page.title,
              components: [],
              bgColor: '#FFFFFF'
            };
          }
        });

        const publicFlow: UIFlow = {
          id: `public-${projectId}`,
          name: `Public Flow - ${projectId}`,
          screens,
          theme
        };

        console.log('✅ Public flow loaded:', publicFlow);
        setFlow(publicFlow);
      } catch (error) {
        console.error('❌ Error loading public flow:', error);
        setError('Failed to load project');
      } finally {
        setLoading(false);
      }
    };

    loadPublicFlow();
  }, [projectId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-gray-600 mb-2">😕</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Project Not Found</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!flow) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-gray-600 mb-2">📱</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Screens Available</h2>
          <p className="text-gray-600">This project doesn't have any screens to display.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-sm mx-auto">
        <MobileFrame
          flow={flow}
          currentScreenIndex={0}
          showNavigation={true}
          editMode={false}
          className="shadow-2xl"
        />
      </div>
    </div>
  );
}; 