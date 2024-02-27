class sidebar extends HTMLElement {
  static observedAttributes = ["home"];
    connectedCallback() {
      this.innerHTML = `
        <div id="sidebar" class="sidebar">
            <div class="sidebar-align-center">
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