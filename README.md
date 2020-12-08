# myuw-feedback

This component works similarily to the Help Dialog component, providing a way to present information in a dialog so users can take action quickly, without leaving the page.

## Getting started

Include the component on your page:

```html
<!-- import the module -->
<script type="module" src="https://cdn.my.wisc.edu/@myuw-web-components/myuw-feedback@latest/myuw-feedback.min.mjs"></script>

<!-- fallback for browsers without ES2015 module support -->
<script nomodule src="https://unpkg.com/@myuw-web-components/myuw-feedback@latest/myuw-feedback.min.js"></script>

<myuw-feedback
  myuw-feedback-title="Give feedback"
  show-button
  show-default-content
  open
>
  <div class="your-div-here" slot="myuw-feedback-content">
    Your custom content
  </div>
</myuw-feedback>
```

_Note:_ The evergreen "latest" version can be used for convenience, but in production settings it is recommended to use the latest [release version](https://github.com/myuw-web-components/myuw-feedback/releases) specifically, and upgrade only after testing!

### Trigger dialog

If you aren't using the top bar button (via the `show-button` attribute), fire the `show-myuw-feedback` event on the `document` when you want the dialog to display (e.g. when your "feedback" button is clicked):

```js
function showFeedbackDialog() {
  var event = new Event('show-myuw-feedback');
  document.dispatchEvent(event);
}
```

### Set up custom positioning

If you want to control the exact positioning of the dialog, you can dispatch a `CustomEvent` called `set-myuw-feedback-position` with position data like so:

```js
function showFeedbackDialog() {
  const event = new CustomEvent('show-myuw-feedback', {
    detail: { // required by CustomEvent spec
      position: { // "position" required by myuw-feedback component
        top: '100px', // "top" required by myuw-feedback component
        left: '100px', // "left" required by myuw-feedback component
      }
    }
  });
  document.dispatchEvent(event);
}
```

*Note: It is important that you use that exact event name and dispatch the event from the document scope. The component listens for the* `show-myuw-feedback`  *and* `set-myuw-feedback-position` *events.*

### Configurable properties via attributes

- **myuw-feedback-title**: The title to display at the top of the dialog
- **show-button**: Include this attribute if you want the icon button to appear the the top bar. If you want to trigger the dialog some other way, you're free to omit this attribute.
- **show-default-content**: Include this attribute if you want to include the default UW-Madison-flavored links. At this time we do not recommend showing the default content, as it is still a work in progress.
- **open**: Only include this attribute if the dialog should be open by default

### Slots

- **myuw-feedback-content**: Use this slot to insert your own content into the dialog (with whatever markup and styling you want).

## Development and contribution

To run the demo app locally and test the component, run the following commands:

```bash
$ npm install
$ npm start
```

Cross-browser testing provided by:<br/>
<a href="https://www.browserstack.com/"><img width="160" src="https://myuw-web-components.github.io/img/Browserstack-logo.svg" alt="BrowserStack"/></a>
