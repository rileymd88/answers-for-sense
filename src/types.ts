import type { GenericObjectLayout} from '@qlik/api/qix';
import { stardust } from "@nebula.js/stardust";

export type Assistant = {
  id: string;
  name: string;
};

export type UseOptions = {
  direction: "ltr" | "rtl";
}

export type Color = {
    color: string;
  }

export type Option = {
  label: string;
  value: string;
};

export interface AppProps {
  layout: Layout;
  interactions: stardust.Interactions;
  options: UseOptions;
  rect: stardust.Rect;
}

export interface Layout extends GenericObjectLayout {
  props: {
    assistantId: string;
    useDialog: boolean;
    theme: "qlik-light" | "qlik-dark";
    icon?: string;
    iconSize?: number;
    iconColor?: Color;
    iconPosition?: "top-left" | "top-right" | "center-left" | "center-center" | "center-right" | "bottom-left" | "bottom-right";
  };
}
