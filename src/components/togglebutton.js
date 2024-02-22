class toggle_button extends HTMLElement {
    static observedAttributes = ["enabled"];
    connectedCallback() {
      this.innerHTML = `
        <md-icon-button>
            <md-icon ${window.localQueue[this.getAttribute("propId")] ? "class='togglebutton-activated'" : ""}>${this.getAttribute("icon")}</md-icon>
        </md-icon-button>
      `;
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if(name == "enabled"){
            this.getElementsByTagName("md-icon-button")[0]
                .getElementsByTagName("md-icon")[0]
                .classList.toggle("togglebutton-activated");
        }
    }
    toggle(){
        if(this.getAttribute("enabled") == "true"){
            this.setAttribute("enabled", "false")
        }else{
            this.setAttribute("enabled", "true")
        }
    }
}
customElements.define('m3-toggle-button', toggle_button);