class playercontrols_bottom extends HTMLElement {
    static observedAttributes = ["value", "playing", "shuffle", "repeat"];
    connectedCallback() {
      this.innerHTML = `
        <div class="playercontrols-bottom">
            <div class="playercontrols-box">
                <div progress="0" class="parent">
                    <div id="playercontrols-box-info" class="playercontrols-box-start child-left">
                        <div class="playercontrols-info-top">
                            <span thingtype="song" thingid="" id="playercontrols-info-title" class="pseudo-link"></span>
                        </div>
                        <div class="playercontrols-info-bottom">
                            <span thingtype="artist" thingid="" id="playercontrols-info-artist" class="pseudo-link"></span>
                             - 
                            <span thingtype="album" thingid="" id="playercontrols-info-album" class="pseudo-link"></span>
                        </div>
                    </div>
                    <div class="buttons child-center">
                        <m3-toggle-button id="playercontrols-bottom-shuffle" propId="shuffled" icon="shuffle" enabled="${window.localQueue.shuffled ? "true" : "false"}" onclick="this.toggle();handleShuffleClick(this)"></m3-toggle-button>
                        <md-filled-button id="playercontrols-bottom-previous" onclick="handlePrev()">
                            <md-icon>skip_previous</md-icon>
                        </md-filled-button>
                        <md-filled-button id="playercontrols-bottom-play" onclick="handlePause()">
                            <md-icon id="playercontrols-bottom-icon">play_circle</md-icon>
                        </md-filled-button>
                        <md-filled-button id="playercontrols-bottom-next" onclick="handleNext()">
                            <md-icon>skip_next</md-icon>
                        </md-filled-button>
                        <m3-toggle-button id="playercontrols-bottom-loop" propId="looped" icon="loop" enabled="${window.localQueue.looped ? "true" : "false"}" onclick="this.toggle();handleLoopClick(this)"></m3-toggle-button>
                    </div>
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
        if(name == "shuffle"){
            if (this.getElementsByTagName("md-icon").length == 0){
                return
            }
            var shuffle = newValue
            this.getElementsByTagName("md-icon")[0].innerHTML = (shuffle == "true" ? "shuffle" : "shuffle");
        }
        if(name == "playing"){
            if (this.getElementsByTagName("md-icon").length == 0){
                return
            }
            var playing = newValue
            this.getElementsByTagName("md-icon")[2].innerHTML = (playing == "true" ? "pause_circle" : "play_circle");
        }
        if(name == "repeat"){
            if (this.getElementsByTagName("md-icon").length == 0){
                return
            }
            var repeat = newValue
            this.getElementsByTagName("md-icon")[4].innerHTML = (repeat == "true" ? "loop" : "loop");
        }
    }
  }

customElements.define('m3-playercontrols-bottom', playercontrols_bottom);