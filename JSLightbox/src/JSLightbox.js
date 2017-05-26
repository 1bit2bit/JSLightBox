/*
*Written By Matthew Burton 
*To use add the css file and js file.
*<link type="text/css" rel="stylesheet" href="/[scripts-folder]/JSLightbox/JSLightbox.css">
*<script src="/[scripts-folder]/JSLightbox/JSLightbox.js" type="text/javascript"></script>
1. Right now it only ajax. Will add support for more later.
2. More documentations is also needed.
3. Only tested in Chrome will test more.
*/
/*
 * 
 * @param {type} options
 * @returns {JSLightBox}
 * 
 * To use JSLightbox to load a ajax url you must specify the URL.
 * A example of a ajax call
 * new JSLightBox({
 *      type : "ajax",
 *      url : "http://mysite.com/myurl/",
 *      method:"get"
 * }).initialize();
 */
var JSLightBox;
JSLightBox = function(options) {
    var parentObject = this;
    this.type = options.type || 'image',
    this.main = null,
    this.background = null,
    this.wrapper = null,
    this.content = null,
    this.mainWindow = null,
    this.paddingTop = this.paddingTop || 50;
    this.paddingBottom = this.paddingBottom || 50;
    this.bindingClass = options.bindingClass || 'JSLightBox',
    this.url = options.url || null,
    this.method = options.method || "get",
    this.width = options.width || "90%",
    this.height = options.height || "auto",
    this.onClose = options.onClose || null, 
    this.onComplete = options.height || null, 
    this.onFailure = options.onFailure || null, 
    this.on404 = options.on404 || null,
    this.async = options.async || true, 
    this.data = options.data || null,
    this.autoAdjust = options.autoAdjust || true,
    this.initialize = function() {                           
        this.create();                     
        switch(this.type) {
            case "ajax":                
                this.loadAjax();                                    
                break;                
            default :
                var elementsArray = document.getElementsByTagName('A');
                if(elementsArray.length > 0 ) {                                                   
                    for(var i = 0 ; i < elementsArray.length;i++) {                                                                                       
                        if(elementsArray[i].className.indexOf(this.bindingClass) !== -1 ) {               
                            elementsArray[i].onclick = function (evt) {
                                //causes the link to not work so we can handle it.                                                             
                                var eventTrigger = evt || window.event;
                                if(eventTrigger.preventDefault){ 
                                    eventTrigger.preventDefault(); 
                                }else{ 
                                    eventTrigger.returnValue = false; 
                                    eventTrigger.cancelBubble=true; 
                                }
                                this.showBox(this,this.type);                                                                                               
                            };
                        }
                    }                                                             
                }
            break;                                  
        }                       
    },
    this.create = function() {        
        var htmlElement = null;
        this.main = document.createElement("div");
        this.main.className = 'JSLightBox_main';
        this.main.id = 'JSLightBox_main';

        //Wrapper div
        this.background = document.createElement("div");
        this.background.className = 'JSLightBox_overlay';
        this.background.id = 'JSLightBox_overlay';
        this.background.onclick = function() {
            parentObject.closeBox();
        };

        //main wrapper               
        this.wrapper = document.createElement("div");
        this.wrapper.className = 'JSLightBox_wrapper';
        this.wrapper.id = 'JSLightBox_wrapper';
        this.wrapper.onclick = function(evt) {
            var eventTrigger = evt || window.event;
            if(eventTrigger.preventDefault){ 
                eventTrigger.preventDefault(); 
            }else{ 
                eventTrigger.returnValue = false; 
                eventTrigger.cancelBubble=true; 
            }
            if(eventTrigger.target.id === parentObject.wrapper.id) {
                parentObject.closeBox();
            }
        };
        
        //window               
        this.mainWindow = document.createElement("div");
        this.mainWindow.className = 'JSLightBox_window';
        this.mainWindow.id = 'JSLightBox_window'; 
        this.mainWindow.onclick = function(evt) {
            var eventTrigger = evt || window.event;
            if(eventTrigger.preventDefault){ 
                eventTrigger.preventDefault(); 
            }else{ 
                eventTrigger.returnValue = false; 
                eventTrigger.cancelBubble=true; 
            }
        };

        //content wrapper
        this.content = document.createElement("div");
        this.content.className = 'JSLightBox_content';    
        this.content.id = 'JSLightBox_content';
        this.content.onclick = function(evt) {
            var eventTrigger = evt || window.event;
            if(eventTrigger.preventDefault){ 
                eventTrigger.preventDefault(); 
            }else{ 
                eventTrigger.returnValue = false; 
                eventTrigger.cancelBubble=true; 
            }
        };

        //closeButton
        this.closeButton = document.createElement("span");
        this.closeButton.className = 'closeButton';
        this.closeButton.onclick = function() {
            parentObject.closeBox();
        };
        
        this.main.appendChild(this.background);
        this.main.appendChild(this.wrapper);      
        this.wrapper.appendChild(this.mainWindow);   
        this.mainWindow.appendChild(this.closeButton); 
        this.mainWindow.appendChild(this.content);       
               

    }
    this.showBox = function() {
        
        window.document.body.appendChild(this.main);
        if(this.autoAdjust) {
            this.adjustWindowHeight();
            window.onresize = function(event) {            
                parentObject.adjustWindowHeight();
            };
        }
        
    },
        
    this.closeBox = function() {
        el = document.getElementById('JSLightBox_main');
        elWindow = document.getElementById('JSLightBox_window');
        elOverlay = document.getElementById('JSLightBox_overlay');
        if(el) {            
            elWindow.className = elWindow.className + " JSLightBox_closeWindow";
            elOverlay.style.opacity = "0";
            setTimeout(function() {
                if(el.parentNode) {
                    el.parentNode.removeChild(el);                                 
                }
            },1000);
            
            if(this.onClose) {
                this.onClose();
            }
        }             
    },
    this.createImageBox = function(element) {
        if(element.tagName === 'A') {
            var imageElement = document.createElement("img");
            imageElement.src = element.href;
            imageElement.className = 'contentImage';
            return imageElement;
        }
    },
    this.loadAjax = function() {
        dataString = "";
        postMethod = this.getMethod;
        httpResponse = "Content not found";
        mainObject = this;
        
        /* ready states I might add support for more later
         * 0      The request is not initialized
         * 1      The request has been set up
         * 2      The request has been sent
         * 3      The request is in process
         * 4      The request is complete
         */
        
        /* Statues
         * 100	Continue
         * 101	Switching protocols
         * 200	OK
         * 201	Created
         * 202	Accepted
         * 203	Non-Authoritative Information
         * 204	No Content
         * 205	Reset Content
         * 206	Partial Content
         * 300	Multiple Choices
         * 301	Moved Permanently
         * 302	Found
         * 303	See Other
         * 304	Not Modified
         * 305	Use Proxy
         * 307	Temporary Redirect
         * 400	Bad Request
         * 401	Unauthorized
         * 402	Payment Required
         * 403	Forbidden
         * 404	Not Found
         * 405	Method Not Allowed
         * 406	Not Acceptable
         * 407	Proxy Authentication Required
         * 408	Request Timeout
         * 409	Conflict
         * 410	Gone
         * 411	Length Required
         * 412	Precondition Failed
         * 413	Request Entity Too Large
         * 414	Request-URI Too Long
         * 415	Unsupported Media Type
         * 416	Requested Range Not Suitable
         * 417	Expectation Failed
         * 500	Internal Server Error
         * 501	Not Implemented
         * 502	Bad Gateway
         * 503	Service Unavailable
         * 504	Gateway Timeout
         * 505	HTTP Version Not Supported
         */
         
        if(this.url !== "") {
            var xhttp = new XMLHttpRequest() || new ActiveXObject("Microsoft.XMLHTTP");   

            if(this.async === true) {
          
                xhttp.onreadystatechange = function() { 
                    if (this.readyState === 4) {
                        httpResponse = xhttp.responseText;
                        switch (this.status) {
                            case 200 :
                                mainObject.ajaxComplete(httpResponse);
                                break;
                            case 404 :
                                mainObject.ajaxNotFound(httpResponse);
                                break;                        
                            default:
                                mainObject.ajaxError(httpResponse);
                                break; 
                        }
                    }
                };
            }

            if(postMethod === "post") {
                xhttp.open("POST",  this.url, this.async);
                xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");          
            } else {
                xhttp.open("GET", this.url, this.async);        
            }


            xhttp.send(dataString);      

            //If false just process the response
            if(this.async === false) {
                mainObject.ajaxComplete();                
            }
        } else {
            mainObject.ajaxNotFound("Page not found");
        }
        
    }, 
    this.getMethod = function() {
        postMethod = this.method || "";

        if(postMethod !== "") {
            if(postMethod.toLowerCase() !== "post") {
              postMethod = "get";  
            } 
        } else {
            postMethod = "get";
        }
        return postMethod;
    },
    this.browserSizes= function() {
        var w = window.outerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        var h = window.outerHeight || document.documentElement.clientHeight || document.body.clientHeight;        
        var iw = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        var ih = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;        
        return {x:w,y:h,ix:iw,ih:ih};
    },
    this.contentSizes= function() {
        var w = this.content.innerWidth || this.content.clientWidth;
        var h = this.content.innerHeight || this.content.clientHeight;        
        return {x:w,y:h};
    },
    this.adjustWindowHeight= function() {
        var sizes = this.browserSizes();
        var contentSizes = this.contentSizes();
        var heightOffset = (sizes.y - this.paddingBottom);
        if((contentSizes.y + this.paddingBottom) < heightOffset) {
            heightOffset = contentSizes.y;
        }
        difference = (sizes.ih - heightOffset) / 2;
        this.mainWindow.style.top = difference;
        this.mainWindow.style.width = this.width;
        this.mainWindow.style.height = heightOffset + "px"
    },
    this.getPostString = function() {
        if(this.data) {
            data = this.data;
            //.return Object.keys(data).map((i) => i+'='+data[i]).join('&')
        };
    },
    this.ajaxComplete = function(response) {
        this.content.innerHTML = response;
        if(this.onComplete) {           
            this.onComplete(response);
        } 
        this.showBox();
    },
    this.ajaxError = function(response) {
        this.content.innerHTML = response;
         if(this.onFailure) {
            this.onFailure(response);
        } 
        this.showBox();
    },
    this.ajaxNotFound = function(response) {
        response = "Page Not Found"
        this.content.innerHTML = response;
         if(this.on404) {
            this.on404(response);
        } 
        this.showBox();
    }
};