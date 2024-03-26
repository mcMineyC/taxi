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


class downloadlistitem extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <md-list-item id="list-item">
                <div id="checkbox-container" slot="start">
                    <md-checkbox id="download-checkbox"></md-checkbox>
                </div>
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
            </md-list-item>
        `
        var tt = this
        if(this.getAttribute("selected") == null){
            this.setAttribute("selected", false)
        }
        if(this.getAttribute("type") == "track"){
            var pu = this.getAttribute("previewUrl")
            console.log("Adding preview url listener for "+pu+", "+typeof(pu))
            this.querySelector("#image-container").addEventListener("click", function(e){
                console.log("Playing preview")
                var s = new Howl({
                    src: [pu],
                    html5: true,
                    onplay: function(){
                        window.localPlayer.setPlaying(true)
                    },
                    onend: function(){
                        window.localPlayer.setPlaying(false)
                    }
                })
                if(typeof(window.howlerInstance) != "undefined"){
                    window.howlerInstance.stop()
                    window.howlerInstance.off("play")
                    window.howlerInstance.off("pause")
                    window.howlerInstance.off("end")
                    window.howlerInstance.off("load")
                    window.localPlayer.setPlaying(false)
                }
                window.howlerInstance = s
                s.play()
            })
        }
        this.querySelector("md-checkbox").addEventListener("click", function(e){
            tt.setAttribute("selected", !e.target.checked)
            updateDownloadFormCount();
        })
        /*
        this.querySelector("#overlay").addEventListener("mouseover", function(e){
            tt.querySelector("#list-item").classList.add("list-item-hover")
        })
        this.querySelector("#overlay").addEventListener("mouseout", function(e){
            tt.querySelector("#list-item").classList.remove("list-item-hover")
        })*/
    }
}

customElements.define('m3-download-list-item', downloadlistitem);