function removeChildren(element){
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

var Buildings = {
    data: [],
    addBuilding: function(building){
        this.data.push(building);
    },
    update: function(){
        for(var i = 0; i < this.data.length; i++){
            this.data[i].update();
        }
    },
}

var Resources = {
    res: [],
    element: null,
    addResource: function(resource){
        for(var i = 0; i < this.res.length; i++){
            if(this.res[i].name == resource.name){
                if(this.res[i].quantity + resource.quantity <= this.res[i].stackSize){
                    this.res[i].addQnty(resource.quantity);
                    //Get quantity element in resource element
                    var qnty = parseInt(this.getResourceElement(resource).children[2].innerHTML.substr(10));
                    this.getResourceElement(resource).children[2].innerHTML = ("Quantity: " + (qnty + resource.quantity));
                    return true;
                }else{
                    return false;
                }
            }
        }
    },
    discoverResource: function(resource){
        var container = document.createElement("div"),
            img = document.createElement("img"),
            span = document.createElement("span"),
            span2 = document.createElement("span");
        container.appendChild(span);
        container.appendChild(img);
        container.appendChild(span2);
        container.style.border = "1px solid black";
        container.style.padding = "2px";
        container.style.backgroundColor = "rgba(164, 171, 166, 0.35)";
        span2.innerHTML = "Quantity: " + resource.quantity;
        img.src = resource.imgSrc;
        img.style.display = "inline-block";
        span.innerHTML = resource.name;
        span.style.display = "block";
        span.style.textAlign = "left";
        this.element.appendChild(container);
        //adding an empty resource into resources
        this.res.push(resource);
    },
    getResourceElement: function(resource){
        for(var i = 1; i < this.element.children.length; i++){
            if(this.element.children[i].children[0].innerHTML == resource.name){
                return this.element.children[i];
            }
        }
    },
    init: function(){
        this.element = document.getElementById("resources");
    },
}

class Resource {
    constructor(name, quantity, stackSize, imgSrc){
        if(name == null){
            this.name = "Unnamed Resource";
        }else{
            this.name = name;
        }
        if(quantity == null){
            this.quantity = 1;
        }else{
            this.quantity = quantity;
        }
        if(stackSize == null){
            this.stackSize = 1;
        }else{
            this.stackSize = stackSize;
        }
        this.addQnty = function(val){
            this.quantity += val;
        };
        this.imgSrc = imgSrc;
    }
}

class Log extends Resource{
    constructor(quantity){
        super("Log", quantity, 20, "Images/Log.png");
    }
}

var Inventory = {
    items: [],
    selectedElement: null,
    slotSelected: null,
    isOpen: false,
    element: null,
    ghostElement: null,
    addItem: function(item){
        item.element.style.position = "relative";
        item.setX(0);
        item.setY(0);
        //Adding to existing item
        for(var i = 0; i < this.items.length; i++){
            if(this.items[i] == null){

            }else{
                if(this.items[i].name == item.name 
                    && this.items[i].stackSize >= this.items[i].quantity + item.quantity){
                    this.items[i].quantity += item.quantity;
                    if(item.element.parentElement != null){
                        item.element.parentElement.removeChild(item.element);
                    }
    
                    //adding item quantity to qntSpan
                    this.items[i].element.parentElement.getElementsByTagName("span")[0].innerHTML = 
                        parseInt(this.items[i].element.parentElement.getElementsByTagName("span")[0].innerHTML)
                        + item.quantity;
                    return;
                }
            }
        }
        //Adding to new slot
        var freeSlot = this.getNextFreeSlotElement();
        if(freeSlot){
            //removing from origial parent
            if(item.element.parentElement != null){
                item.element.parentElement.removeChild(item.element);
            }

            //adding to inventory
            this.items[(freeSlot.id.substr(4,1)-1)] = item;
            
            //adding to first free slot
            var container = document.createElement("div"),
                qntSpan = document.createElement("span");
            item.element.style.maxHeight = "100%";
            container.appendChild(item.element);
            container.appendChild(qntSpan);
            container.style.position = "relative";
            container.style.width = freeSlot.clientWidth;
            container.style.height = freeSlot.clientHeight;
            qntSpan.innerHTML = item.quantity
            qntSpan.style.position = "absolute";
            qntSpan.style.bottom = "0";
            qntSpan.style.right = "0";
            qntSpan.style.color = "orange";
            qntSpan.style.textAlign = "right";
            
            freeSlot.appendChild(container);
        }
    },
    removeItemAtPos: function(pos){
        //Removing from items array
        //this.items.splice((pos), 1);
        this.items[pos-1] = null;

        //Deleting element in inventory element
        removeChildren(Inventory.getElementAtSlot(pos).parentElement);
    },
    getNextFreeSlotElement: function(){
        for(var i = 1; i < 11; i++){
            if(document.getElementById("slot"+i).children.length == 0){
                return document.getElementById("slot"+i);
            }
        }
        return false;
    },
    selectSlot: function(slotElement){
        //click on self to deselect
        if(slotElement == this.selectedElement){
            Inventory.deselect();
        }else{
            //deselect old
            if(this.selectedElement != null){
                Inventory.deselect();
            }
            //select new
            this.slotSelected = slotElement.id.substr(4,1);
            slotElement.className = "selectedSlot";
            Inventory.selectedElement = slotElement;
            //Only display ghost if slot is occupied
            if(this.selectedElement.children.length > 0){
                this.ghostElement.style.display = "inline-block";
            }
        }
    },
    deselect: function(){
        if(this.selectedElement == null){
            return;
        }
        this.selectedElement.className = "slot";
        this.selectedElement = null;
        this.ghostElement.style.display = "none";
    },
    toggleOpen: function(){
        if(this.isOpen){
            this.element.className = "inventoryClosed";
            this.isOpen = false;
        }else{
            this.element.className = "inventoryOpen";
            this.isOpen = true;
        }
    },
    open: function(){
        if(this.isOpen){
            return;
        }
        this.element.className = "inventoryOpen";
        this.isOpen = true;
    },
    close: function(){
        if(!this.isOpen || this.selectedElement){
            return;
        }
        this.element.className = "inventoryClosed";
        this.isOpen = false;
    },
    getItemAtSlot: function(slotNum){
        return Inventory.items[(slotNum - 1)];
    },
    getElementAtSlot: function(slotNum){
        return document.getElementById("slot"+slotNum).children[0];
    },
    updateGhost: function(event){
         if(Inventory.selectedElement != null){
            Inventory.ghostElement.style.left = event.pageX + 5;
            Inventory.ghostElement.style.top  = event.pageY + 5;
        }
    },
    init: function(){
        this.element = document.getElementById("inventory");
        //populating inventory
        for(var i = 1; i < 11; i++){
            this.items[i] = null;
        }
        //open eventlistener
        this.element.addEventListener("mouseover", function(){
            Inventory.open();
            Mouse.isInsideInventory = true;
        });
        this.element.addEventListener("mouseleave", function(){
            Inventory.close();
            Mouse.isInsideInventory = false;
        });

        //setting up slot event listeners
        for(var i = 1; i < 11; i++){
            document.getElementById("slot"+i)
            .addEventListener("click", function(){
                Inventory.selectSlot(this);        
            });
        }

        //ghost updating
        Inventory.ghostElement = document.createElement("div");
        Inventory.ghostElement.style.width  = "25px";
        Inventory.ghostElement.style.height = "25px";
        Inventory.ghostElement.style.border = "1px dashed black";
        this.ghostElement.style.display = "none";
        this.ghostElement.style.position = "absolute";
        document.body.appendChild(Inventory.ghostElement);
        
    },
}

var Store = {
    element: null,
    isOpen: true,
    toggleOpen: function(){
        if(Store.isOpen){
            Store.element.className = "storeClose";
            Store.isOpen = false;
        }else{
            Store.element.className = "storeOpen";
            Store.isOpen = true;
        }
    },
    open: function(){
        if(this.isOpen){
            return;
        }
        Store.element.style.transform = "translateX(0px)";
        Store.isOpen = true;
    },
    close: function(){
        if(!this.isOpen){
            return;
        }
        var storeWidth = Store.element.clientWidth - 20;
        Store.element.style.transform = "translateX(-"+storeWidth+"px)";
        Store.isOpen = false;
    },
    init: function(){
        //Setting up element
        this.element = document.getElementById("store");
        //Open store event listener
        document.getElementById("store").addEventListener("mouseover",function(){
            Store.open();
        });
        document.getElementById("store").addEventListener("mouseleave",function(){
            Store.close();
        });
        Store.close();
    },
}

var Mouse = {
    isInsideInventory: null,
}

class Actor{
    constructor(type, stackSize){
        this.quantity = 1;
        if(type == null){
            this.type = "Undefined";
        }else{
            this.type = type;
        }
        if(stackSize == null){
            this.stackSize = 1;
        }else{
            this.stackSize = stackSize;
        }
    };
}

class Item extends Actor{
    constructor(name, quantity, imgSrc){
        super("Item");
        this.name = name;
        this.element = document.createElement("img");
        this.element.src = imgSrc;
        if(quantity == null){
            this.quantity = 1;
        }else{
            this.quantity = quantity;
        }
    };
}

class Building extends Actor{
    constructor(name, x, y, stackSize, imgSrc){
        super("Building");
        var _this = this;
        this.update = null;
        this.stackSize = stackSize;
        if(name == null){
            this.name = "No Name";
        }else{
            this.name = name;
        }
        this.element = document.createElement("img");
        this.element.style.border = "1px solid black";
        this.toolTip = null;
        this.element.addEventListener("mouseenter", function(){
            //Create tooltip
            this.toolTip = document.createElement("div");
            this.toolTip.style.backgroundColor = "#a4aba6";
            this.toolTip.style.border = "1px solid black";
            this.toolTip.style.padding = "1px";
            this.toolTip.innerHTML = _this.name;
            this.toolTip.style.position = "absolute";
            this.toolTip.style.left = event.pageX + 15;
            this.toolTip.style.top = event.pageY - 15;
            document.body.appendChild(this.toolTip);
        });
        this.element.addEventListener("mouseleave", function(){
            //Remove toolTip
            document.body.removeChild(this.toolTip);
        });
        this.x = null;
        this.y = null;
        this.setX(x);
        this.setY(y);
        
        
        this.element.style.position = "absolute";
        if(imgSrc == null){

        }else{
            this.element.src = imgSrc;
        }
    }
    setX = function(val){ 
        this.x = val;
        this.element.style.left = val;
    };
    setY = function(val){ 
        this.y = val; 
        this.element.style.top = val;
    };
}

class Generator extends Building{
    constructor(){
        super("Generator", 50, 50, 1, "Images/building.png");
        this.update = function(){
            if(Resources.addResource(new Log(1))){
                Effects.createPlus(this.x+5, this.y+5, 1, "green");
            }else{
                Effects.createPlus(this.x+5, this.y+5, 0, "red")
            };
        };
    }
}

var Effects = {
    data: [],
    createPlus: function(x, y, val, color){
        var span = document.createElement("span");
        span.style.color = color;
        span.style.textShadow = "1px 1px 0px rgba(0,0,0,0.5)";
        span.style.textShadow += ",-1px -1px 0px rgba(0,0,0,0.5)";
        span.style.textShadow += ",1px -1px 0px rgba(0,0,0,0.5)";
        span.style.textShadow += ",-1px 1px 0px rgba(0,0,0,0.5)";
        span.innerHTML = "+"+val;
        span.style.position = "absolute";
        span.style.top = y;
        span.style.left = x;
        span.style.transform = "translateY(0px)";
        span.style.transition = "all 0.49s ease";
        setTimeout(function(){
            span.style.transform = "translateY(-50px)";
        }, 1);
        setTimeout(function(){
            document.body.removeChild(span);
        }, 500);
        document.body.appendChild(span);
    },
}

function tick(){
    Buildings.update();
};

window.addEventListener("mousemove", Inventory.updateGhost);
window.addEventListener("click", function(){
    //Deselecting if nothing is clicked with nothing selected
    if(Inventory.selectedElement != null){
        if(Inventory.selectedElement.children.length == 0 
            && Mouse.isInsideInventory == false){
            Inventory.deselect();
            Inventory.close();
        }
    }
    
    //Operating on body with selected element
    if(Inventory.selectedElement != null && Mouse.isInsideInventory == false){
        var item = Inventory.getItemAtSlot(Inventory.slotSelected);
        if(item == null){
            return;
        }
        switch(item.type){
            case "Building":
                //Placing building
                var e = Inventory.getElementAtSlot(Inventory.slotSelected).children[0];
                e.style.position = "absolute";
                Buildings.addBuilding(Inventory.getItemAtSlot(Inventory.slotSelected));
                Inventory.deselect();
                //Setting buildings coords
                item.setX(event.pageX + 5);
                item.setY(event.pageY + 5);
                //Removing one quantity or element
                if(item.quantity > 1){
                    item.quantity--;
                    Inventory.getElementAtSlot(Inventory.slotSelected).children[1].innerHTML--;
                }else{
                    //removing from origial parent
                    if(item.element.parentElement != null){
                        item.element.parentElement.removeChild(item.element);
                        Inventory.removeItemAtPos(Inventory.slotSelected);
                    }
                }
                //placing element on window
                document.body.appendChild(e);

                Inventory.close();
            break;
        }
    }
});

window.onload = function(){
    console.clear();
    Inventory.init();
    Store.init();
    Resources.init();

    Inventory.addItem(new Generator());
    Inventory.addItem(new Generator());

    Resources.discoverResource(new Log(0));
    Resources.addResource(new Log(1));

    //Main game loop
    setInterval(tick, 1000);
};

window.onresize = function(){
    //Fix store open length
    Store.open();
    Store.close();
};