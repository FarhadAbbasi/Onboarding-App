import React from 'react';
import ContentEditorSidebar from './ContentEditorSidebar';
import ContentEditorCanvas from './ContentEditorCanvas';
import ContentEditorProperties from './ContentEditorProperties';
import DragDropDemo from './DragDropDemo';
import SidebarDropDemo from './SidebarDropDemo';
import { AlertMessage, CTA, FeatureCard, Footer, Headline, StyledLink, Subheadline, Testimonial, TextInput } from '../ui/UIElements';
import DemoPage from '../ui/DemoPage';

const ContentEditor: React.FC = () => {
  return (
    <div className="flex h-[80vh] w-full bg-white rounded shadow overflow-hidden">
      {/* <ContentEditorSidebar /> */}
      {/* <ContentEditorCanvas /> */}
      {/* <ContentEditorProperties /> */}
      {/* <SidebarDropDemo /> */}


      <div className="flex justify-between m-4 overflow-y-auto">
        <DemoPage />
      </div>

      <div className="flex w-full justify-between m-4 overflow-y-auto">
      <ContentEditorCanvas />
      </div>


    </div>
  );
};

export default ContentEditor; 