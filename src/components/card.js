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
            <div id="overlay" thingtype="${this.getAttribute('thingtype')}" thingid="${this.getAttribute('thingid')}"></div>
        </div>
        `;
    }
  }

customElements.define('m3-mediacard', mediacard);