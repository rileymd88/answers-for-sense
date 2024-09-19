import { useElement, useEffect, useLayout, useInteractionState, useOptions, useRect } from '@nebula.js/stardust';
import properties from './object-properties';
import data from './data';
import ext from './ext';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/App';
import { Layout, UseOptions } from './types';
import '@qlik/embed-web-components';

export default function supernova() {
  return {
    qae: {
      properties,
      data,
    },
    component() {
      const element = useElement();
      const layout = useLayout() as Layout;
      const interactions = useInteractionState();
      const options = useOptions() as UseOptions;
      const rect = useRect();

      useEffect(() => {
        const root = createRoot(element);
        root.render(
          <App
            interactions={interactions}
            layout={layout}
            options={options}
            rect={rect}
          />
        );

        return () => {
          root.unmount();
        };
      }, [element, layout, interactions, rect, options]);

      useEffect(() => {
        // Set the necessary attributes for the web components
        document.body.setAttribute('data-host', `https://${window.location.host}`);
        document.body.setAttribute('data-cross-site-cookies', 'true');
      }, []);
    },
    ext: ext(),
  };
}