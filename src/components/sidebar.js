class sidebar extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
        <div id="sidebar" class="sidebar">
            <div class="sidebar-align-center">
                <md-fab>
                    <md-icon slot="icon">search</md-icon>
                </md-fab>
                <md-filled-icon-button>
                    <md-icon>menu</md-icon>
                </md-filled-icon-button>
                <md-icon-button>
                    <md-icon>menu</md-icon>
                </md-icon-button>
            </div>
        </div>  
      `;
    }
  }

customElements.define('m3-sidebar', sidebar);