class listitem extends HTMLElement {
    connectedCallback() {
        console.log(this.getAttribute('artist'));
        this.innerHTML = `
            <md-list-item id="list-item">
                <div id="image-container" slot="start">
                    <img src="${this.getAttribute('image')}">
                </div>
                <div id="start-container">
                    <span class="oneline">
                        ${this.getAttribute('text')}
                    </span>
                </div>
                 <div id="end-container" slot="end">
                    <span>${this.getAttribute('endText')}</span>
                </div>
                <div id="overlay" thingtype="${this.getAttribute('thingtype')}" thingid="${this.getAttribute('thingid')}"></div>
            </md-list-item>
        `
        var tt = this
        this.querySelector("#overlay").addEventListener("mouseover", function(e){
            tt.querySelector("#list-item").classList.add("list-item-hover")
        })
        this.querySelector("#overlay").addEventListener("mouseout", function(e){
            tt.querySelector("#list-item").classList.remove("list-item-hover")
        })
    }
}

customElements.define('m3-list-item', listitem);