declare module '@qlik/runtime-module-loader' {
  export type MainJsResolveHostConfig = {
    embedRuntimeUrl?: string;
    host?: string;
    url?: string;
  };

  export type Mounted = {
    $destroy(): void;
    $set(props: Record<string, unknown>): void;
  };

  export type MountVanillaEmbedComponent = (args: {
    target: HTMLElement;
    props: Record<string, unknown>;
  }) => Mounted;

  export function importRuntimeModule(
    name: 'embed-vanilla@v1',
    hostConfig?: MainJsResolveHostConfig
  ): Promise<{
    mountVanillaEmbedComponent: MountVanillaEmbedComponent;
  }>;
}
