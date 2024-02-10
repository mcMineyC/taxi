class playercontrols_bottom extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
        <div class="playercontrols-bottom">
            <div class="playercontrols-box">
                <div progress="0">
                    <md-filled-tonal-button id="playercontrols-bottom-previous">
                        <md-icon>skip_previous</md-icon>
                    </md-filled-tonal-button>
                    <md-filled-tonal-button id="playercontrols-bottom-play">
                        <md-icon>play_circle</md-icon>
                    </md-filled-tonal-button>
                    <md-filled-tonal-button id="playercontrols-bottom-next">
                        <md-icon>skip_next</md-icon>
                    </md-filled-tonal-button>
                </div>
                <div class="playercontrols-spacer"></div>
                <div progress="1">
                    <md-linear-progress value="0.69" id="playercontrols-bottom-progress"></md-linear-progress>
                </div>
            </div>
        </div>
      `;
    }
  }

customElements.define('m3-playercontrols-bottom', playercontrols_bottom);