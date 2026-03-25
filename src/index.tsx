import { useElement, useEffect, useLayout, useInteractionState, useOptions, useRect } from '@nebula.js/stardust';
import properties from './object-properties';
import data from './data';
import ext from './ext';
import * as React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import App from './components/App';
import { Layout, UseOptions } from './types';

const rootsByElement = new WeakMap<Element, Root>();

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

      useEffect(() => {
        let root = rootsByElement.get(element);
        if (!root) {
          root = createRoot(element);
          rootsByElement.set(element, root);
        }

        root.render(
          <App
            hostConfig={hostConfig}
            interactions={interactions}
            layout={layout}
            options={options}
            rect={rect}
          />
        );
      }, [element, hostConfig, interactions, layout, options, rect]);

      useEffect(() => {
        return () => {
          const root = rootsByElement.get(element);
          if (root) {
            root.unmount();
            rootsByElement.delete(element);
          }
        };
      }, [element]);
    },
    ext: ext(),
  };
}
