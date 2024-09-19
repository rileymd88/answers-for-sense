declare namespace JSX {
    interface IntrinsicElements {
      'qlik-embed': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        ui?: string;
        assistantId?: string;
        appearance?: string;
      }, HTMLElement>;
    }
  }