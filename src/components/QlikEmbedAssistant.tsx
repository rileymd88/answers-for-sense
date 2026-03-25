import React, { useEffect, useMemo, useRef } from 'react';
import type { HostConfig } from '@qlik/api/auth';
import { importRuntimeModule } from '@qlik/runtime-module-loader';

type AssistantUi = 'ai/assistant' | 'ai/agentic-assistant';

type AssistantEmbedProps = {
  assistantId: string;
  appearance?: 'qlik-light' | 'qlik-dark';
  hostConfig?: HostConfig;
  ui: AssistantUi;
  variant?: string;
};

type Mounted = {
  $destroy(): void;
  $set(props: Record<string, unknown>): void;
};

const QlikEmbedAssistant: React.FC<AssistantEmbedProps> = ({ assistantId, appearance, hostConfig, ui, variant }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mountedRef = useRef<Mounted | null>(null);
  const latestPropsRef = useRef<Record<string, unknown>>({});

  const embedProps = useMemo(
    () =>
      ({
        assistantId,
        appearance,
        hostConfig,
        ui,
        variant,
      }) as Record<string, unknown>,
    [assistantId, appearance, hostConfig, ui, variant]
  );

  latestPropsRef.current = embedProps;

  useEffect(() => {
    if (!hostConfig || !containerRef.current) {
      return;
    }

    let isCancelled = false;

    importRuntimeModule('embed-vanilla@v1', hostConfig)
      .then(({ mountVanillaEmbedComponent }) => {
        if (isCancelled || !containerRef.current) {
          return;
        }

        mountedRef.current = mountVanillaEmbedComponent({
          target: containerRef.current,
          props: latestPropsRef.current as any,
        });
      })
      .catch((error: unknown) => {
        console.error('Failed to initialize Qlik embed assistant runtime', error);
      });

    return () => {
      isCancelled = true;
      mountedRef.current?.$destroy();
      mountedRef.current = null;
    };
  }, [hostConfig]);

  useEffect(() => {
    mountedRef.current?.$set(embedProps as any);
  }, [embedProps]);

  return <div ref={containerRef} className="answers-for-sense-embed-root" style={{ display: 'contents' }} />;
};

export default QlikEmbedAssistant;
