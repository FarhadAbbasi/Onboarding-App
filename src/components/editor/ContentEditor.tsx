import React from 'react';
import ContentEditorSidebar from './ContentEditorSidebar';
import ContentEditorCanvas from './ContentEditorCanvas';
import ContentEditorProperties from './ContentEditorProperties';
import DragDropDemo from './DragDropDemo';
import SidebarDropDemo from './SidebarDropDemo';
import { MobileText, MobileButton, MobileInput, MobilePhone } from '../ui/UIElements';

const ContentEditor: React.FC = () => {
  return (
    <div className="flex h-[80vh] w-full bg-white rounded shadow overflow-hidden">
      {/* <ContentEditorSidebar /> */}
      {/* <ContentEditorCanvas /> */}
      {/* <ContentEditorProperties /> */}
      {/* <SidebarDropDemo /> */}


      <div className="flex justify-between m-4 overflow-y-auto">
        <MobilePhone>
          <div className="p-4 space-y-4">
            <MobileText text="Mobile Content Editor Demo" variant="h2" alignment="center" />
            <MobileButton text="Sample Mobile Button" variant="primary" />
            <MobileInput placeholder="Enter mobile text..." label="Sample Input" />
          </div>
        </MobilePhone>
      </div>

      <div className="flex w-full justify-between m-4 overflow-y-auto">
      <ContentEditorCanvas />
      </div>


    </div>
  );
};

export default ContentEditor; 