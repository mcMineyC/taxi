class sidebar extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
        <div id="sidebar" class="sidebar">
            <div class="sidebar-align-center">
                <md-fab>
                    <md-icon slot="icon">menu</md-icon>
                </md-fab>
                <md-fab lowered size="small">
                    <md-icon slot="icon">menu</md-icon>
                </md-fab>
                <md-fab lowered size="small">
                    <md-icon slot="icon">menu</md-icon>
                </md-fab>
            </div>
        </div>  
      `;
    }
  }

customElements.define('m3-sidebar', sidebar);