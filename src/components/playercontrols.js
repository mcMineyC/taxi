class playercontrols_bottom extends HTMLElement {
    static observedAttributes = ["value", "playing"];
    connectedCallback() {
      this.innerHTML = `
        <div class="playercontrols-bottom">
            <div class="playercontrols-box">
                <div progress="0">
                    <md-filled-tonal-button id="playercontrols-bottom-previous" onclick="handlePrev()">
                        <md-icon>skip_previous</md-icon>
                    </md-filled-tonal-button>
                    <md-filled-tonal-button id="playercontrols-bottom-play" onclick="handlePause()">
                        <md-icon id="playercontrols-bottom-icon">play_circle</md-icon>
                    </md-filled-tonal-button>
                    <md-filled-tonal-button id="playercontrols-bottom-next" onclick="handleNext()">
                        <md-icon>skip_next</md-icon>
                    </md-filled-tonal-button>
                </div>
                <div class="playercontrols-spacer"></div>
                <div progress="1">
                    <md-linear-progress value="0" id="playercontrols-bottom-progress"></md-linear-progress>
                </div>
            </div>
        </div>
      `;
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if(name == "value"){
            this.getElementsByTagName("md-linear-progress")[0].setAttribute("value", newValue);
        }
        if(name == "playing"){
            if (this.getElementsByTagName("md-icon").length == 0){
                return
            }
            var playing = newValue
            this.getElementsByTagName("md-icon")[1].innerHTML = (playing == "true" ? "pause_circle" : "play_circle");
        }
    }
  }

customElements.define('m3-playercontrols-bottom', playercontrols_bottom);