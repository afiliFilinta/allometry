define(() => {


    function createSideBar(randomButton, renderButton, exportButton) {

        var sidebarDiv = document.getElementById("sidebar");
        sidebarDiv.className = "sidebar";
        var divCanvas = document.getElementById("canvas");
        divCanvas.className = "pad";

        //fill window
        var windowHeight = window.innerHeight;
        var divCanvasHeight = windowHeight - 30;

        //set sidebar and pad sizes and store in 
        divCanvas.setAttribute("style", "height:" + divCanvasHeight + "px;");
        sidebarDiv.setAttribute("style", "min-height:" + divCanvasHeight + "px;");

        var e = document.createElement("SPAN");
        e.className = "title";
        e.innerHTML = "Allometry";
        e.innerHTML += '<span class="n">ITU</span>';
        sidebarDiv.appendChild(e);

        e = document.createElement("DIV");
        e.className = "divSeparator";
        sidebarDiv.appendChild(e);


        // m1
        e = document.createElement("BR");
        sidebarDiv.appendChild(e);

        e = document.createElement("SPAN");
        e.className = "letterLabel";
        e.innerHTML = "m1";
        sidebarDiv.appendChild(e);

        e = document.createElement("INPUT");
        e.className = "number";
        e.setAttribute("type", "number");
        e.setAttribute("value", defaultSettings.m1);
        e.setAttribute("id", "m1");
        sidebarDiv.appendChild(e);

        // n1.1
        e = document.createElement("BR");
        sidebarDiv.appendChild(e);

        e = document.createElement("SPAN");
        e.className = "letterLabel";
        e.innerHTML = "n1.1";
        sidebarDiv.appendChild(e);

        e = document.createElement("INPUT");
        e.className = "number";
        e.setAttribute("type", "number");
        e.setAttribute("value", defaultSettings.n11);
        e.setAttribute("id", "n11");
        sidebarDiv.appendChild(e);

        // n2.2
        e = document.createElement("BR");
        sidebarDiv.appendChild(e);

        e = document.createElement("SPAN");
        e.className = "letterLabel";
        e.innerHTML = "n2.2";
        sidebarDiv.appendChild(e);

        e = document.createElement("INPUT");
        e.className = "number";
        e.setAttribute("type", "number");
        e.setAttribute("value", defaultSettings.n12);
        e.setAttribute("id", "n12");
        sidebarDiv.appendChild(e);

        // n1.3
        e = document.createElement("BR");
        sidebarDiv.appendChild(e);

        e = document.createElement("SPAN");
        e.className = "letterLabel";
        e.innerHTML = "n1.3";
        sidebarDiv.appendChild(e);

        e = document.createElement("INPUT");
        e.className = "number";
        e.setAttribute("type", "number");
        e.setAttribute("value", defaultSettings.n13);
        e.setAttribute("id", "n13");
        sidebarDiv.appendChild(e);


        e = document.createElement("DIV");
        e.className = "divSeparator";
        sidebarDiv.appendChild(e);



        // m2
        e = document.createElement("BR");
        sidebarDiv.appendChild(e);

        e = document.createElement("SPAN");
        e.className = "letterLabel";
        e.innerHTML = "m2";
        sidebarDiv.appendChild(e);

        e = document.createElement("INPUT");
        e.className = "number";
        e.setAttribute("type", "number");
        e.setAttribute("value", defaultSettings.m2);
        e.setAttribute("id", "m2");
        sidebarDiv.appendChild(e);

        // n2.1
        e = document.createElement("BR");
        sidebarDiv.appendChild(e);

        e = document.createElement("SPAN");
        e.className = "letterLabel";
        e.innerHTML = "n2.1";
        sidebarDiv.appendChild(e);

        e = document.createElement("INPUT");
        e.className = "number";
        e.setAttribute("type", "number");
        e.setAttribute("value", defaultSettings.n21);
        e.setAttribute("id", "n21");
        sidebarDiv.appendChild(e);

        // n2.2
        e = document.createElement("BR");
        sidebarDiv.appendChild(e);

        e = document.createElement("SPAN");
        e.className = "letterLabel";
        e.innerHTML = "n2.2";
        sidebarDiv.appendChild(e);

        e = document.createElement("INPUT");
        e.className = "number";
        e.setAttribute("type", "number");
        e.setAttribute("value", defaultSettings.n22);
        e.setAttribute("id", "n22");
        sidebarDiv.appendChild(e);

        // n2.3
        e = document.createElement("BR");
        sidebarDiv.appendChild(e);

        e = document.createElement("SPAN");
        e.className = "letterLabel";
        e.innerHTML = "n2.3";
        sidebarDiv.appendChild(e);

        e = document.createElement("INPUT");
        e.className = "number";
        e.setAttribute("type", "number");
        e.setAttribute("value", defaultSettings.n23);
        e.setAttribute("id", "n23");
        sidebarDiv.appendChild(e);

        e = document.createElement("DIV");
        e.className = "divSeparator";
        sidebarDiv.appendChild(e);

        // Resolution

        e = document.createElement("BR");
        sidebarDiv.appendChild(e);

        e = document.createElement("SPAN");
        e.className = "letterLabel";
        e.innerHTML = "Resolution";
        sidebarDiv.appendChild(e);

        e = document.createElement("INPUT");
        e.className = "number";
        e.setAttribute("type", "number");
        e.setAttribute("value", defaultSettings.resolution);
        e.setAttribute("id", "resolution");
        sidebarDiv.appendChild(e);

        // Wire
        e = document.createElement("BR");
        sidebarDiv.appendChild(e);

        e = document.createElement("SPAN");
        e.className = "letterLabel";
        e.innerHTML = "Wire";
        sidebarDiv.appendChild(e);

        e = document.createElement("INPUT");
        e.className = "number";
        e.setAttribute("type", "checkbox");
        e.setAttribute("class", "checkmark");
        e.setAttribute("id", "wire");
        sidebarDiv.appendChild(e);

        e = document.createElement("DIV");
        e.className = "divSeparator";
        sidebarDiv.appendChild(e);

        // Random Button

        var button = makeButton("random", "small", "random", false);
        var image = makeImage("randomIcon", "edit", "img/random.png");
        button.appendChild(image);
        sidebarDiv.appendChild(button);
        button.addEventListener("click", randomButton);

        // Render Button

        var button = makeButton("render", "small", "render", false);
        var image = makeImage("renderIcon", "edit", "img/render.png");
        button.appendChild(image);
        sidebarDiv.appendChild(button);
        button.addEventListener("click", () => {
            const params = {
                m1: document.getElementById("m1").getAttribute("value"),
                n11: document.getElementById("n11").getAttribute("value"),
                n12: document.getElementById("n12").getAttribute("value"),
                n13: document.getElementById("n13").getAttribute("value"),
                m2: document.getElementById("m2").getAttribute("value"),
                n21: document.getElementById("n21").getAttribute("value"),
                n22: document.getElementById("n22").getAttribute("value"),
                n23: document.getElementById("n23").getAttribute("value"),
            }
            renderButton(params);
        });

        // Export Button 

        var button = makeButton("export", "small", "export", false);
        var image = makeImage("exportIcon", "edit", "img/export.png");
        button.appendChild(image);
        sidebarDiv.appendChild(button);
        button.addEventListener("click", exportButton);
    }


    function makeButton(id, className, title, text) {
        var button = document.createElement("BUTTON");
        if (className) {
            button.setAttribute("class", className);
        }
        if (id) {
            button.setAttribute("id", id);
        }
        if (title) {
            button.setAttribute("title", title);
        }
        if (text) {
            button.innerHTML = text;
        }
        return button;
    }

    function makeImage(id, className, src) {
        var i = document.createElement("IMG");
        if (className) {
            i.setAttribute("class", className);
        }
        if (id) {
            i.setAttribute("id", id);
        }
        if (src) {
            i.setAttribute("src", src);
        }
        return i;
    }

    return {
        createSideBar,
    };
});