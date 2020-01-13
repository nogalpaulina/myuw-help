import tpl from './myuw-help.html';

class MyUWHelp extends HTMLElement {

  static get elementName() {
    return 'myuw-help';
  }

  static get observedAttributes() {
    return [
      'myuw-help-title',
      'open',
      'show-button',
      'show-default-content'
    ];
  }

  static get template() {
    if (this._template===undefined) {
      this._template=document.createElement('template');
      this._template.innerHTML=tpl;
    }
    return this._template;
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(this.constructor.template.content.cloneNode(true));
    this.$customPosition={};
    this.titleHeadingElement=this.shadowRoot.getElementById('myuw-help__title');
    this.$button=this.shadowRoot.getElementById('help-button');
    this.$dialog=this.shadowRoot.getElementById('myuw-help__dialog');
    this.contentSlotElement=this.shadowRoot.querySelector('slot[name=myuw-help-content]');
    this.$backdrop=this.shadowRoot.getElementById('myuw-help__shadow');
    this.$dialogCloseButton=this.shadowRoot.getElementById('myuw-help__close-button');
    this.eventListeners=[
      { target: document, type: 'set-myuw-help-position', handler: event => this.handleDocumentSetHelpPosition(event) },
      { target: document, type: 'show-myuw-help', handler: event => this.handleDocumentShowHelp(event) },
      { target: this.$backdrop, type: 'click', handler: event => this.handleBackdropClick(event) },
      { target: this.$button, type: 'click', handler: event => this.handleButtonClick(event) },
      { target: this.$dialog, type: 'keydown', handler: event => this.handleDialogKeydown(event) },
      { target: this.$dialogCloseButton, type: 'click', handler: event => this.handleDialogCloseButtonClick(event) }
    ];
  }

  /**
   * Array of the focusable elements within the modal, with the close button last.
   * Always expected to have length 1 or greater, because of the close button.
   *
   * @returns {Array<Element>}
   */
  get focusableElements() {
    const selector="a[href], input:not([disabled]), button:not([disabled]), button, select, textarea";
    const focusableElements=this.contentSlotElement.assignedElements({ flatten: true })
      .reduce(
        (agg, node) => {
          if (node.matches(selector)) {
            agg.push(node);
          }
          else {
            node.querySelectorAll(selector).forEach(each => agg.push(each));
          }
          return agg;
        },
        []
      )
      ;
    focusableElements.push(this.$dialogCloseButton);
    return focusableElements;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case 'myuw-help-title':
        this.titleHeadingElement.innerHTML=newValue;
        break;
      case 'open':
        // opening
        if (oldValue===null&&newValue!==null) {
          this.setDialogPosition();
          this.focusableElements[0].focus();
          return;
        }
        // closing
        if (oldValue!==null&&newValue===null) {
          this.resetDialogPosition();
        }
        // no change in open/close state; do nothing
        break;
      case 'show-button':
        break;
      case 'show-default-content':
        break;
    }
  }

  connectedCallback() {
    this.eventListeners.forEach(({ target, type, handler }) => target.addEventListener(type, handler));
  }

  disconnectedCallback() {
    this.eventListeners.forEach(({ target, type, handler }) => target.removeEventListener(type, handler));
  }

  handleButtonClick(event) {
    this.toggle();
    event.preventDefault();
  }

  handleDocumentShowHelp(event) {
    this.toggle();
    event.preventDefault();
  }

  handleDocumentSetHelpPosition(event) {
    if (event.detail&&event.detail.position) {
      this.$customPosition=event.detail.position;
    }
    event.preventDefault();
  }

  handleDialogKeydown(event) {
    switch (event.key) {
      default:
        return;
      case 'Escape':
        this.close();
        break;
      case 'Tab':
        if (event.shiftKey) {
          this.focusPrevious();
        }
        else {
          this.focusNext();
        }
        break;
      case 'ArrowDown':
        this.focusNext();
        break;
      case 'ArrowUp':
        this.focusPrevious();
        break;
    }
    event.preventDefault();
  }

  handleBackdropClick(event) {
    this.close();
    event.preventDefault();
  }

  handleDialogCloseButtonClick(event) {
    this.close();
    event.preventDefault();
  }

  toggle() {
    if (this.hasAttribute('open')) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.setAttribute('open', '');
  }

  close() {
    this.removeAttribute('open');
  }

  /**
   * Focus the next option in the dialog, cycling around to the first
   */
  focusNext() {
    const focusableElements=this.focusableElements;
    const focusedElement=this.isSameNode(document.activeElement)? this.shadowRoot.activeElement:document.activeElement;
    const focusedIndex=focusableElements.indexOf(focusedElement);
    if (focusedIndex===focusableElements.length-1||focusedIndex===-1) {
      focusableElements[0].focus();
    }
    else {
      focusableElements[focusedIndex+1].focus();
    }
  }

  /**
   * Focus the previous option in the dialog, cycling around to the last (the close button)
   */
  focusPrevious() {
    const focusableElements=this.focusableElements;
    const focusedElement=this.isSameNode(document.activeElement)? this.shadowRoot.activeElement:document.activeElement;
    const focusedIndex=focusableElements.indexOf(focusedElement);
    if (focusedIndex===0||focusedIndex===-1) {
      focusableElements[focusableElements.length-1].focus();
    }
    else {
      focusableElements[focusedIndex-1].focus();
    }
  }

  /**
   * Position the dialog off-screen
   */
  resetDialogPosition() {
    this.$dialog.style.top=0;
    this.$dialog.style.left='auto';
    this.$dialog.style.right='-1000px';
  }

  /**
   * Position the dialog in the middle of the screen
   */
  setDialogPosition() {
    if (this.$customPosition.left&&this.$customPosition.top) {
      this.$dialog.style.left=this.$customPosition.left;
      this.$dialog.style.top=this.$customPosition.top;
      this.$dialog.style.right='auto';
      return;
    }
    // Dialog dimensions
    const dialogWidth=this.$dialog.offsetWidth;
    const dialogHeight=this.$dialog.offsetHeight;
    // Screen dimensions
    // These variables check to make sure mobile is supported and scroll bar is accounted for across browsers
    const cssWidth=window.innerWidth&&document.documentElement.clientWidth
      ? Math.min(window.innerWidth, document.documentElement.clientWidth):window.innerWidth||
      document.documentElement.clientWidth||
      document.getElementsByTagName('body')[0].clientWidth;
    const cssHeight=window.innerHeight&&document.documentElement.clientHeight
      ? Math.min(window.innerHeight, document.documentElement.clientHeight):window.innerHeight||
      document.documentElement.clientHeight||
      document.getElementsByTagName('body')[0].clientHeight;
    // Dialog position
    const topPosition=((cssHeight-dialogHeight)/3);
    const leftPosition=((cssWidth-dialogWidth)/2);
    // Set positioning
    this.$dialog.style.left=leftPosition+'px';
    this.$dialog.style.top=topPosition+'px';
    this.$dialog.style.right='auto';
  }

}

if (customElements.get(MyUWHelp.elementName)===undefined) {
  customElements.define(MyUWHelp.elementName, MyUWHelp);
}
