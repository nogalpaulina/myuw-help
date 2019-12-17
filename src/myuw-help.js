import tpl from './myuw-help.html';
class MyUWHelp extends HTMLElement {

  constructor() {
    super();
    this.focusableElementsString = "a[href], input:not([disabled]), button:not([disabled]), button, select, textarea";

    // Create a shadowroot for this element
    this.attachShadow({ mode: 'open' });

    // Append the custom HTML to the shadowroot
    this.shadowRoot.appendChild(MyUWHelp.template.content.cloneNode(true));
  }

  static get observedAttributes() {
    return [
      'myuw-help-title',
      'open',
      'show-default-content',
      'show-button'
    ];
  }

  /**
  *   Web component lifecycle hook to update changed properties
  */
  attributeChangedCallback(name, oldValue, newValue) {
    // Update the attribute internally
    this[name] = newValue;
    // Update the component
    this.updateComponent();
  }

  /**
  *   When component is first attached to the DOM,
  *   get its defined attributes and set up listeners
  */
  connectedCallback() {
    // Get all attributes
    this['myuw-help-title'] = this.getAttribute('myuw-help-title');
    this['open'] = this.getAttribute('open');
    this['show-default-content'] = this.getAttribute('show-default-content');
    this['show-button'] = this.getAttribute('show-button');

    this.$button = this.shadowRoot.getElementById('help-button');
    this.$dialog = this.shadowRoot.getElementById('myuw-help__dialog');
    this.$dialogContentDefaultElements = this.shadowRoot.getElementById('myuw-help__default-content');
    this.$dialogTitle = this.shadowRoot.getElementById('myuw-help__title');
    this.$backdrop = this.shadowRoot.getElementById('myuw-help__shadow');
    this.$dialogCloseButton = this.shadowRoot.getElementById('myuw-help__close-button');
    this.$customPosition = {};

    // Convert NodeList into Array
    this.focusableDefaultElements = this.$dialogContentDefaultElements.querySelectorAll(this.focusableElementsString);
    this.focusableDefaultElements = Array.from(this.focusableDefaultElements);

    // Listen for open events and set positioning
    this.$button.addEventListener('click', () => {
      this.setDialogState();
    });

    document.addEventListener('show-myuw-help', () => {
      this.setDialogState();
    });

    // Listen for custom positioning event
    /**
      * @typedef {Object} position
      * @property {String} top A value for the CSS "top" attribute
      * @property {String} left A value for the CSS "left" attribute
    */
    document.addEventListener('set-myuw-help-position', (data) => {
      if (data.detail && data.detail.position) {
        this.$customPosition = data.detail.position;
      }
    });

    // Listen for close events
    this.$dialog.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        this.setDialogState(false);
      }
    });
    this.$backdrop.addEventListener('click', () => {
      this.setDialogState(false);
    });
    this.$dialogCloseButton.addEventListener('click', () => {
      this.setDialogState(false);
    });

    // Listen for keyboard events
    this.$dialog.addEventListener('keydown', (event) => {
      this.dialogFocusTrap(event);
    });

  }

  /**
  *   Update the component state
  */
  updateComponent() {
    this.shadowRoot.getElementById('myuw-help__title').innerHTML = this['myuw-help-title'];
  }

  /**
   * Open or close the dialog, focus it if opened
   * @param {string} newState Optional parameter, either 'open' or 'closed'
   */
  setDialogState(newState) {
    let firstTabFocus = this.$dialogCloseButton;

    if (this.focusableCustomElements && this.focusableCustomElements.length > 0) {
      firstTabFocus = this.focusableCustomElements[0];
    } else if (this.focusableDefaultElements && this.focusableDefaultElements.length > 0) {
      firstTabFocus = this.focusableDefaultElements[0]
    }

    switch (newState) {
      case false:
        // close the dialog
        this.removeAttribute('open');
        this.resetDialogPosition();
        break;
      case true:
        // open the dialog
        this.setAttribute('open', '');
        this.setDialogPosition();
        firstTabFocus.focus();
        break;
      default:
        if (this.hasAttribute('open')) {
          // close the dialog
          this.removeAttribute('open');
          this.resetDialogPosition();
        } else {
          // open the dialog
          this.setAttribute('open', '');
          this.setDialogPosition();
          firstTabFocus.focus();
        }
        break;
    }
  }

  /**
   * Focus trap
   */
  dialogFocusTrap(e) {
    // Get list of focusable custom elements on help dialog. Convert NodeList into Array
    this.$dialogContentCustomElements = document.querySelectorAll('myuw-help [slot=myuw-help-content]');
    if (this.$dialogContentCustomElements.length) {
      this.focusableCustomElements = this.$dialogContentCustomElements[0].querySelectorAll(this.focusableElementsString);
      this.focusableCustomElements = Array.from(this.focusableCustomElements);
    }

    let closeDialogBtn = this.$dialogCloseButton;

    // Check if custom content was added to help dialog
    if (this.focusableCustomElements && this.focusableCustomElements.length > 0) {
      let firstCustomTabFocus = this.focusableCustomElements[0];
      let lastCustomTabFocus = this.focusableCustomElements[this.focusableCustomElements.length - 1];
      // Pressing Tab
      if (e.key === "Tab") {
        // Shift + Tab
        if (e.shiftKey) {
          if (this.shadowRoot.activeElement === closeDialogBtn) {
            e.preventDefault();
            lastCustomTabFocus.focus();
          } else if (document.activeElement === firstCustomTabFocus) {
            e.preventDefault();
            closeDialogBtn.focus();
          }
        } else {
          if (document.activeElement === lastCustomTabFocus) {
            e.preventDefault();
            closeDialogBtn.focus();
          }
        }
      }
    } else if (!this.focusableCustomElements && this.focusableDefaultElements && this.focusableDefaultElements.length > 0) {
      let firstDefaultTabFocus = this.focusableDefaultElements[0];
      let lastDefaultTabFocus = this.focusableDefaultElements[this.focusableDefaultElements.length - 1];
      // Pressing Tab
      if (e.key === "Tab") {
        // Shift + Tab
        if (e.shiftKey) {
          if (this.shadowRoot.activeElement === closeDialogBtn) {
            e.preventDefault();
            lastDefaultTabFocus.focus();
          } else if (this.shadowRoot.activeElement === firstDefaultTabFocus) {
            e.preventDefault();
            closeDialogBtn.focus();
          }
        } else {
          if (this.shadowRoot.activeElement === lastDefaultTabFocus) {
            e.preventDefault();
            closeDialogBtn.focus();
          }
        }
      }
    } else {
      e.preventDefault();
      closeDialogBtn.focus();
    }
  }

  /**
   * Position the dialog off-screen
   */
  resetDialogPosition() {
    this.$dialog.style.top = 0;
    this.$dialog.style.left = 'auto';
    this.$dialog.style.right = '-1000px';
  }

  /**
   * Position the dialog in the middle of the screen
   */
  setDialogPosition() {
    if (this.$customPosition.left && this.$customPosition.top) {
      this.$dialog.style.left = this.$customPosition.left;
      this.$dialog.style.top = this.$customPosition.top;
      this.$dialog.style.right = 'auto';
    } else {
      // Dialog dimensions
      var dialogWidth = this.$dialog.offsetWidth;
      var dialogHeight = this.$dialog.offsetHeight;

      // Screen dimensions
      /*
        These variables check to make sure mobile is supported and scroll bar is accounted for across browsers
      */
      var cssWidth = window.innerWidth && document.documentElement.clientWidth
        ? Math.min(window.innerWidth, document.documentElement.clientWidth) : window.innerWidth ||
        document.documentElement.clientWidth ||
        document.getElementsByTagName('body')[0].clientWidth;
      var cssHeight = window.innerHeight && document.documentElement.clientHeight
        ? Math.min(window.innerHeight, document.documentElement.clientHeight) : window.innerHeight ||
        document.documentElement.clientHeight ||
        document.getElementsByTagName('body')[0].clientHeight;

      // Dialog position
      var topPosition = ((cssHeight - dialogHeight) / 3);
      var leftPosition = ((cssWidth - dialogWidth) / 2);;

      // Set positioning
      this.$dialog.style.left = leftPosition + 'px';
      this.$dialog.style.top = topPosition + 'px';
      this.$dialog.style.right = 'auto';
    }
  }
}

MyUWHelp.template = (function template(src) {
  const template = (document.createElement('template'));
  template.innerHTML = src;
  return template;
})(tpl);

/**
 * Polyfill for supporting the CustomEvent constructor in IE9+
 * From: https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent#Polyfill
 */
(function () {
  if (typeof window.CustomEvent === 'function') {
    return false;
  }

  function CustomEvent(event, params) {
    params = params || { bubbles: false, cancelable: false, detail: undefined };
    var evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
    return evt;
  }
  CustomEvent.prototype = window.Event.prototype;
  window.CustomEvent = CustomEvent;
})();

window.customElements.define('myuw-help', MyUWHelp);
