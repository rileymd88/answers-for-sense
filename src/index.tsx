import { useElement, useEffect, useLayout, useInteractionState, useOptions, useRect, useApp } from '@nebula.js/stardust';
import properties from './object-properties';
import data from './data';
import ext from './ext';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/App';
import { Layout, UseOptions } from './types';
import '@qlik/embed-web-components';

export default function supernova(env: any) {
  const { hostConfig } = env;
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
      const app = useApp();
      const appId = app?.id;

      useEffect(() => {
        const root = createRoot(element);
        root.render(
          <App
            interactions={interactions}
            layout={layout}
            options={options}
            rect={rect}
            appId={appId}
          />
        );

        return () => {
          root.unmount();
        };
      }, [appId, element, interactions, layout, options, rect]);

      useEffect(() => {
        const script = document.createElement('script');
        script.setAttribute('data-host', hostConfig.host);
        script.setAttribute('data-cross-site-cookies', 'true');
        document.head.appendChild(script);

        return () => {
          document.head.removeChild(script);
        };
      }, []);
    },
    ext: ext(),
  };
}
