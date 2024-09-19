import { useElement, useEffect, useLayout, useInteractionState, useOptions, useRect } from '@nebula.js/stardust';
import properties from './object-properties';
import data from './data';
import ext from './ext';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/App';
import { Layout, UseOptions } from './types';

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
        const scriptId = 'qlik-embed-web-components-script';
        const scriptUrl = 'https://cdn.jsdelivr.net/npm/@qlik/embed-web-components@1/dist/index.min.js';

        const loadScript = () => {
          const existingScript = document.getElementById(scriptId);
          if (!existingScript) {
            const script = document.createElement('script');
            script.id = scriptId;
            script.crossOrigin = 'anonymous';
            script.type = 'application/javascript';
            script.src = scriptUrl;
            script.dataset.host = `https://${window.location.host}`;
            script.dataset.crossSiteCookies = "true";
            document.body.appendChild(script);
          }
        };

        loadScript();
      }, []);
    },
    ext: ext(),
  };
}