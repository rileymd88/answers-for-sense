export default function ext() {
  const getAssistants = () => {
    return new Promise((resolve, reject) => {
      const headers = {
        'Content-Type': 'application/json',
      };
      const options = {
        method: 'GET',
        headers: headers,
      };
      fetch('../api/v1/assistants', options)
        .then(response => {
          if (response.ok && response.status === 200) {
            return response.json();
          }
          throw new Error('Failed to fetch assistants');
        })
        .then(assistants => {
          resolve(assistants.data.map((assistant) => ({
            label: assistant.name,
            value: assistant.id,
          })));
        })
        .catch(error => {
          reject(error);
        });
    });
  };

  const assistantId = {
    component: "expression-with-dropdown",
    dropdownOnly: false,
    expressionType: "StringExpression",
    translation: "Assistant",
    ref: "props.assistantId",
    options: () => {
      return getAssistants();
    },
    defaultValue: "",
  };

  const assistantHelpText = {
    component: "text",
    translation: "When using a formula to define the assistant, you need to ensure you provide a valid assistant ID.",
    ref: "props.assistantHelpText",
  };

  const settings = {
    component: "expandable-items",
    translation: "Common.Appearance",
    uses: "settings",
    items: {
      general: {
        type: "items",
        translation: "properties.general",
        items: {
          showTitles: {},
          disableNavMenu: {},
          showDetails: {},
          details: {
            show: false,
          },
          cellNavMenu: {
            show: false,
          },
        },
      },
      presentation: {
        type: "items",
        grouped: false,
        translation: "properties.presentation",
        items: {
          styleEditor: {
            component: "styling-panel",
            chartTitle: "Chart",
            translation: "LayerStyleEditor.component.styling",
            subtitle: "LayerStyleEditor.component.styling",
            ref: "components",
            useGeneral: true,
            useBackground: true,
          },
        },
      },
    },
  };

  const dialog = {
    type: "boolean",
    component: "switch",
    ref: "props.useDialog",
    translation: "Use dialog",
    defaultValue: false,
    options: [
      {
        value: true,
        translation: "properties.on",
      },
      {
        value: false,
        translation: "properties.off",
      },
    ],
  };

  const definition = {
    type: "items",
    component: "accordion",
    items: {
      settings,
      assistant: {
        grouped: true,
        type: "items",
        label: "Assistant",
        component: "items",
        items: {
          assistantId,
          assistantHelpText,
          dialog,
        },
      }
    },
  };

  return {
    definition,
    support: {
      snapshot: false,
      export: true,
      sharing: false,
      exportData: true,
      viewData: true,
    },
  };
}