import type { GenericObjectLayout } from '@qlik/api/qix';
import { stardust } from '@nebula.js/stardust';

export type Assistant = {
  id: string;
  name: string;
  legacy?: boolean;
};

export type UseOptions = {
  direction: 'ltr' | 'rtl';
};

export type Color = {
  color: string;
  index?: string;
};

export type Option = {
  label: string;
  value: string;
};

export type DialogSizePreset = 'compact' | 'standard' | 'wide' | 'full';

export interface AppProps {
  layout: Layout;
  interactions: stardust.Interactions;
  options: UseOptions;
  rect: stardust.Rect;
  appId?: string;
}

export interface Layout extends GenericObjectLayout {
  props: {
    assistantId: string;
    legacyAssistant?: boolean;
    useDialog: boolean;
    dialogMode?: 'dialog' | 'drawer';
    dialogSizePreset?: DialogSizePreset;
    drawerPosition?: 'left' | 'right';
    draggable?: boolean;
    resizable?: boolean;
    theme: 'qlik-light' | 'qlik-dark';
    icon?: string;
    iconSize?: number;
    iconColor?: Color;
    iconPosition?:
      | 'top-left'
      | 'top-right'
      | 'center-left'
      | 'center-center'
      | 'center-right'
      | 'bottom-left'
      | 'bottom-right';
  };
}
