class sidebar extends HTMLElement {
  static observedAttributes = ["home"];
    connectedCallback() {
      this.innerHTML = `
        <div id="sidebar" class="sidebar">
            <div class="sidebar-align-center">
                <div id="a">
                    <span class="sidebar-back-button" style="display: ${this.getAttribute('home') == "true" ? "none;" : "block;"}"><md-icon-button onclick="back()"><md-icon>arrow_back</md-icon></md-icon-button></span>
                    <md-icon-button variant="primary" onclick="queueClick()">
                        <md-icon>queue_music</md-icon>
                    </md-icon-button>
                    <md-icon-button onclick="playlistClick()">
                        <md-icon>playlist_add</md-icon>
                    </md-icon-button>
                    <md-icon-button onclick="downloadClick()">
                        <md-icon>download</md-icon>
                    </md-icon-button>
                    <!--
                    <md-icon-button onclick="saveQueueClick()">
                        <md-icon>save</md-icon>
                    </md-icon-button>
                    <md-icon-button onclick="window.localPlayer.clearQueue(true)">
                        <md-icon>clear</md-icon>
                    </md-icon-button>-->
                </div>
                <div id="b" style="display: none">                
                    <md-slider id="volume-slider" min="0" max="100" value="100" class="vert" orient="vertical"></md-slider>
                </div>
              </div>
        </div>  
      `;
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if(name == "home"){
          this.getElementsByClassName("sidebar-back-button")[0].style.display = (newValue == "true" ? "none" : "block");
        }
    }
  }

customElements.define('m3-sidebar', sidebar);