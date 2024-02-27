class queuelistitem extends HTMLElement {
    connectedCallback() {
        console.log(this.getAttribute('artist'));
        this.innerHTML = `
            <md-list-item id="queue-list-item">
                <div id="image-container" slot="start">
                    <img src="${this.getAttribute('image')}">
                </div>
                <div id="song-container">
                    <span class="oneline">
                        <span class="pseudo-link" thingtype="song" thingid="${this.getAttribute('song')}" onclick="${this.getAttribute('albumClick')}">${this.getAttribute('song')}</span> - 
                        <span class="pseudo-link" thingtype="artist" thingid="${this.getAttribute('artist')}" onclick="${this.getAttribute('artistClick')}">
                            ${window.fetchedData.getArtist(this.getAttribute('artist'))["displayName"]}: 
                        </span>
                        <span class="pseudo-link" thingtype="album" thingid="${this.getAttribute('album')}" onclick="${this.getAttribute('albumClick')}">
                            ${window.fetchedData.getAlbum(this.getAttribute('album'))["displayName"]}
                        </span>
                    </span>
                </div>
                 <div id="duration-container" slot="end">
                    <span>${this.getAttribute('duration')}</span>
                </div>
            </md-list-item>
        `
    }
}

customElements.define('m3-queue-list-item', queuelistitem);