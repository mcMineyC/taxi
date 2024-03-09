class playercontrols_bottom extends HTMLElement {
    static observedAttributes = ["value", "volume", "playing", "shuffle", "repeat"];
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
                        <md-icon-button id="playercontrols-bottom-shuffle" onclick="handleShuffleClick()"><md-icon>shuffle</md-icon></md-icon-button>
                        <md-filled-button id="playercontrols-bottom-previous" onclick="handlePrev()">
                            <md-icon>skip_previous</md-icon>
                        </md-filled-button>
                        <md-filled-button id="playercontrols-bottom-play" onclick="handlePause()">
                            <md-icon id="playercontrols-bottom-icon">play_circle</md-icon>
                        </md-filled-button>
                        <md-filled-button id="playercontrols-bottom-next" onclick="handleNext()">
                            <md-icon>skip_next</md-icon>
                        </md-filled-button>
                        <m3-toggle-button id="playercontrols-bottom-loop" propId="looped" icon="loop" enabled="${(window.localPlayer == undefined ? {"looped": false} : window.localPlayer).looped ? "true" : "false"}" onclick="this.toggle();handleLoopClick(this)"></m3-toggle-button>
                    </div>
                    <div id="playercontrols-box-volume">
                        <md-icon-button variant="primary" onclick="handleMuteClick(this)">
                            <md-icon>volume_up</md-icon>
                        </md-icon-button>
                        <md-slider ticks id="playercontrols-bottom-volume" min="0" max="15" value="15"></md-slider>
                    </div>
                </div>
                <div class="playercontrols-spacer"></div>
                <div progress="1">
                    <md-linear-progress value="0" id="playercontrols-bottom-progress"></md-linear-progress>
                </div>
            </div>
        </div>
      `;
      var vs = this.getElementsByTagName("md-slider")[0]
      vs.onwheel = (eve) => {
        console.log(eve)
        eve.preventDefault()
        eve.stopPropagation()
        volumeScrollThrottled(vs,eve)
      }
      vs.addEventListener("change", function(){
          window.Howler.volume(vs.value / 15)
      })
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
        if(name == "volume"){
            console.log({"volume": newValue})
            if (this.getElementsByTagName("md-slider").length == 0){
                return
            }
            var volume = newValue
            this.getElementsByTagName("md-slider")[0].setAttribute("value", volume);
        }
    }
  }

customElements.define('m3-playercontrols-bottom', playercontrols_bottom);