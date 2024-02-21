class queuelistitem extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <md-list-item id="queue-list-item">
                <div id="image-container" slot="start">
                    <img src="${this.getAttribute('image')}">
                </div>
                <div id="song-container">
                    <span>${this.getAttribute('song')} - <span onclick="${this.getAttribute('artistClick')}">${this.getAttribute('artist')}: </span><span onclick="${this.getAttribute('albumClick')}">${this.getAttribute('album')}</span></span>
                </div>
                 <div id="duration-container" slot="end">
                    <span>${this.getAttribute('duration')}</span>
                </div>
            </md-list-item>
        `
    }
}

customElements.define('m3-queue-list-item', queuelistitem);