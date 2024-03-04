class mediacard extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <div class="card">
            <div class="card-image-holder">
                <img class="card-image" src="${this.getAttribute('image')}">
            </div>
            <div class="card-caption">
                <h1 class="card-title">${this.getAttribute('text')}</h1>
            </div>
            <md-icon-button class="card-context" thingtype="${this.getAttribute('thingtype')}" thingid="${this.getAttribute('thingid')}">
                <md-icon>more_vert</md-icon>
            </md-icon-button>
            <div id="overlay" thingtype="${this.getAttribute('thingtype')}" thingid="${this.getAttribute('thingid')}"></div>
        </div>
        `;
        this.getElementsByTagName("md-icon-button")[0].addEventListener("click", (e) => {
            e.stopPropagation();
            e.preventDefault();
            console.log("context menu")
            contextMenu(e)
        });
    }
  }

customElements.define('m3-mediacard', mediacard);