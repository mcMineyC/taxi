class mediacard extends HTMLElement {
    connectedCallback() {
        var inn = `
        <div class="card">
            <div class="card-image-holder">
                <img class="card-image" src="${this.getAttribute('image')}">
            </div>
            <div class="card-caption">
                <h1 class="card-title oneline" data-tippy-content="${this.getAttribute('text')}">${this.getAttribute('text')}</h1>
            </div>
            <div data-tippy-content="${this.getAttribute('text')}" id="overlay" thingtype="${this.getAttribute('thingtype')}" thingid="${this.getAttribute('thingid')}" ${this.getAttribute('thingindex') ? "thingindex='"+this.getAttribute('thingindex')+"'" : ""}></div>
        `;
        var m = (navigator.userAgent.includes("iPad") || navigator.userAgent.includes("Android"))
        if(m == true){
            console.log("Adding context menu")
            inn += `
                <md-icon-button class="card-context" thingtype="${this.getAttribute('thingtype')}" thingid="${this.getAttribute('thingid')}">
                    <md-icon>more_vert</md-icon>
                </md-icon-button>`
        }
        inn += `</div>`
        this.innerHTML = inn
        if(m == true){
            this.getElementsByTagName("md-icon-button")[0].addEventListener("click", function(e){
                e.preventDefault()
                e.stopPropagation()
                contextMenu(e)
            })
        }
    }
  }

customElements.define('m3-mediacard', mediacard);