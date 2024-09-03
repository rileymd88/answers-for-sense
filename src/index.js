import { useElement, useEffect, useLayout, useInteractionState } from '@nebula.js/stardust';
import properties from './object-properties';
import data from './data';
import ext from './ext';

export default function supernova() {
  return {
    qae: {
      properties,
      data,
    },
    component() {
      const element = useElement();
      const layout = useLayout();
      const interactionState = useInteractionState();
      const editMode = interactionState.edit;


      useEffect(() => {
        const scriptId = 'qlik-embed-web-components-script';
        const scriptUrl = 'https://cdn.jsdelivr.net/npm/@qlik/embed-web-components@1/dist/index.min.js';

        const showCSPMessage = () => {
          element.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; height: 100%;">
              <p style="font-size: 16px; color: #666; text-align: center;">
                Unable to load required script. Please add https://cdn.jsdelivr.net to the Content Security Policy with the connect-src and script-src directives.
              </p>
            </div>
          `;
        };

        const checkScriptAvailability = async () => {
          try {
            const response = await fetch(scriptUrl, { method: 'HEAD' });
            if (response.ok) {
              loadScript();
            } else {
              showCSPMessage();
            }
          } catch (error) {
            console.error('Error checking script availability:', error);
            showCSPMessage();
          }
        };

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
        checkScriptAvailability();
      }, []);

      useEffect(() => {
        try {
          if (layout.props.assistantId === "") {
            element.innerHTML = `
              <div style="display: flex; justify-content: center; align-items: center; height: 100%;">
                <p style="font-size: 16px; color: #666;">Please select an Assistant</p>
              </div>
            `;
          } else if (layout.props.useDialog) {
            const isDarkTheme = layout.props.theme !== 'qlik-light';
            element.innerHTML = `
              <style>
                #answers-for-sense-chat-icon {
                  cursor: pointer;
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%);
                }
                #answers-for-sense-chat-dialog {
                  padding: 40px 20px 20px;
                  border: none;
                  border-radius: 8px;
                  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                  width: 90%;
                  max-width: 1000px;
                  height: 90%;
                  max-height: 800px;
                  position: fixed;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%);
                  margin: 0;
                  background-color: ${isDarkTheme ? '#333' : '#fff'};
                  color: ${isDarkTheme ? '#fff' : '#333'};
                }
                #answers-for-sense-chat-dialog::backdrop {
                  background-color: rgba(0, 0, 0, 0.5);
                }
                #answers-for-sense-close-dialog {
                  position: absolute;
                  top: 10px;
                  right: 10px;
                  width: 40px;
                  height: 40px;
                  background-color: ${isDarkTheme ? '#555' : '#f0f0f0'};
                  border: none;
                  border-radius: 50%;
                  font-size: 24px;
                  cursor: pointer;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  z-index: 1;
                  color: ${isDarkTheme ? '#fff' : '#333'};
                }
                #answers-for-sense-dialog-content {
                  width: 100%;
                  height: 100%;
                  overflow: auto;
                }
              </style>
              <div id="answers-for-sense-chat-icon" ${editMode ? 'style="pointer-events: none;"' : ''}>
                <img src="https://cdn.qlikcloud.com/qmfe/frontend-assets/1.38.1/illustrations/landing_and_empty_state/general/chat.svg" alt="Chat Icon" width="48" height="48">
              </div>
              <dialog id="answers-for-sense-chat-dialog">
                <button id="answers-for-sense-close-dialog" ${editMode ? 'disabled' : ''}>×</button>
                <div id="answers-for-sense-dialog-content">
                  <qlik-embed
                    ui="ai/assistant"
                    assistant-id="${layout.props.assistantId}"
                    appearance="${layout.props.theme}"
                  ></qlik-embed>
                </div>
              </dialog>
              <div class="edit-mode-overlay" style="display: ${editMode ? 'block' : 'none'};"></div>
            `;

            const chatIcon = element.querySelector('#answers-for-sense-chat-icon');
            const dialog = element.querySelector('#answers-for-sense-chat-dialog');
            const closeButton = element.querySelector('#answers-for-sense-close-dialog');

            if (!editMode) {
              chatIcon.addEventListener('click', () => {
                dialog.showModal();
              });

              closeButton.addEventListener('click', () => {
                dialog.close();
              });

              dialog.addEventListener('click', (event) => {
                const rect = dialog.getBoundingClientRect();
                const isInDialog = (rect.top <= event.clientY && event.clientY <= rect.top + rect.height
                  && rect.left <= event.clientX && event.clientX <= rect.left + rect.width);
                if (!isInDialog) {
                  dialog.close();
                }
              });
            }
          } else {
            element.innerHTML = `
              <qlik-embed
                ui="ai/assistant"
                assistant-id="${layout.props.assistantId}"
                appearance="${layout.props.theme}"
              ></qlik-embed>
              <div class="edit-mode-overlay" style="display: ${editMode ? 'block' : 'none'};"></div>
            `;
          }
        } catch (error) {
          console.error('Error in component effect:', error);
          element.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; height: 100%;">
              <p style="font-size: 16px; color: #666;">An error occurred. Please try again later.</p>
            </div>
          `;
        }
      }, [layout.props.useDialog, layout.props.assistantId, editMode, layout.props.theme]);
    },
    ext: ext(),
  };
}