// DOM elements
const cnv= document.getElementById("cnvs01");
const cnv_logo= document.getElementById("cnvs02");
const img_btn= document.getElementById("img_btn");
const logo_btn= document.getElementById("logo_btn");
const dwnl_btn= document.getElementById("dwnl_btn");

//Contexts
const ctx= cnv.getContext("2d");
const ctx_logo= cnv_logo.getContext("2d");

//Flags
var img_chrgd= false;
var logo_chrgd= false;

//Util variables
var f_name;
var W, H;
var obj_logo= {
  opacity: 0.25, //0: transparent, 1: opaque
  scale: 0.3, // 1: actual size of logo
  posX: 0.5 - 0.5*0.3, //Relative upper-left X position of logo within the base image
  posY: 0.5 - 0.5*0.3 //Relative upper-left Y position of logo within the base image
};
var prms= ["opacity", "scale", "posX", "posY"];
var pressed_bars= [];
var original_color_bars;


//**************
// LISTENERS
//**************

//Actions when document is loaded
addEventListener("load", (e)=> {
  //Set position of circle markers for each level bar
  document.querySelectorAll(".bar-interval").forEach((i_bar,j) => {
      //When the circle marks are loaded, position them at their initial values
      var mark= i_bar.querySelector('.circle-marker');
      var d_circ= mark.getBoundingClientRect().width;
      
      mark.style.left= ( obj_logo[prms[j]] * (i_bar.offsetWidth - d_circ) )+ "px";
      pressed_bars[j]= false;
      
      if(j==0) original_color_bars= i_bar.style.background; //Save the original background
      
      i_bar.style.background= "rgb(118, 118, 204)"; //Background when bars disabled
  });

  Telegram.WebApp.ready();

});


//When click mouse ends, the pressed bar is unpressed
addEventListener("mouseup", unpress_bar);



//Movility for touch devices. If touch end, call the mouseup listener
addEventListener("touchend", unpress_bar);




//When mouse is moving if some bar is pressed, move its mark
addEventListener('mousemove', (e) => {
  //Detect the pressed bar
  var j= pressed_bars.findIndex((elem) => elem);
  if(j==-1) return; //Exit if no bar is pressed
  
  var marker = document.querySelectorAll('.bar-interval')[j].querySelector('.circle-marker');
  
  //Just move when imgs have been loaded
  if(!img_chrgd || !logo_chrgd || marker===null) { return; }
  
  move_marker(marker, e.clientX, j); //Move the mark and set the level of its variable
  
});



//Movility for touch devices. If there's movement while screen is pulsed, call the mousemove listener
addEventListener('touchmove', (e) => {
  var j= pressed_bars.findIndex((elem) => elem);
  if(j==-1) return;

  //Dispatch a mouse event
  e.preventDefault();
  dispatchEvent(new MouseEvent("mousemove", {
    bubbles: true,
    cancelable: true,
    clientX: e.touches[0].clientX,
    clientY: e.touches[0].clientY
  }));
  
});




//Add listener to the image file button
img_btn.addEventListener("change", (ev)=> {
  const file = ev.target.files[0];

  //If the file was NOT loaded, end the function
  if(!file) {
    cnv.width=0; cnv.height=0;
    disable_button(logo_btn.parentNode);
    disable_button(dwnl_btn.parentNode);
    img_chrgd= false;
    return;
  }
  

  //When the file is loaded, we follow with the algorithm
  const reader = new FileReader();
  f_name= file.name;
  
  reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
          // Adjust size of image's canvas
          cnv.width = img.width;
          cnv.height = img.height;
          W= cnv.width; H= cnv.height;

          // Draw the image in the canvas
          ctx.drawImage(img, 0, 0);
      };
      img.src = e.target.result;
  };
  reader.readAsDataURL(file);

  enable_button(logo_btn.parentNode);
  img_chrgd= true;
});




//Add listener to the logo button
logo_btn.addEventListener("change", (ev)=> {
  const file = ev.target.files[0];

  //If the file was NOT loaded, end the function
  if(!file) {
    disable_button(dwnl_btn.parentNode);
    logo_chrgd= false;
    return;
  }
  
  //Force the img_btn to redraw the base image, to erase the old logo
  if(logo_chrgd) img_btn.dispatchEvent(new Event("change"));
  else {
    document.querySelectorAll('.bar-interval').forEach((i_bar) => {i_bar.style.background= original_color_bars;} )
  }
  

  //When the logo file is loaded, we follow with the algorithm
  const reader = new FileReader();
  
  reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => draw_logo(img);
      img.src = e.target.result;
  };
  reader.readAsDataURL(file);

  enable_button(dwnl_btn.parentNode);
  logo_chrgd= true;
});



//Prevent logo click if image is not charged
logo_btn.addEventListener('click', (eve) => {
  if(!img_chrgd) { e.preventDefault(); return; }
});



//Add download button listener
dwnl_btn.addEventListener('click', (ev) => {
            if(!img_chrgd || !logo_chrgd) { ev.preventDefault(); return; }
            
            const link = document.createElement('a');
            
            //Get name and extension of file
            const regex = /^(.*?)(\.[^.]*$|$)/;
            const outp = regex.exec(f_name);

            const f_nm= outp[1];
            const extnsn= outp[2].substring(1);
            
            //Download image (HTML method)
            link.download = `${f_nm}_mod.${extnsn}`;
            link.href = cnv.toDataURL(`image/${extnsn}`);
            link.click();
            
            //Download (Telegram method)
            //Telegram.WebApp.downloadFile({
            //  url: link.href,
            //  file_name: link.download
            //});
            Telegram.WebApp.showPopup({message: link.href, buttons:[{type: "ok"},{type: "close"}]});
});



//Listeners for all the interval bars
document.querySelectorAll('.bar-interval').forEach((i_bar, j) => {
  
  //With click at a point of the bar, set the opacity level and move the mark circle
  i_bar.addEventListener('click', (e) => {
      //If some of the images has not been loaded, exit from the function
      if(!img_chrgd || !logo_chrgd) { return; }

      var marker = e.target.querySelector('.circle-marker');
      //If marker is null (it happens when the user clicks over the mark), stop the function
      if(marker === null) { return; }
      
      //Move marker and set its corresponding variable
      move_marker(marker, e.clientX, j);
      
      //Dispatch the logo file charger, to redraw the canvas
      logo_btn.dispatchEvent(new Event("change"));
      
  });
  
  
  
  //If some bar is pressed (when is enabled because img and logo are selected), change its flag to true
  i_bar.addEventListener('mousedown', (e) => {
    if(img_chrgd && logo_chrgd) pressed_bars[j] = true;
  });
  
  
  
  //Movility for touch devices, it screams when touch starts
  i_bar.addEventListener('touchstart', (e) => {
    if(img_chrgd && logo_chrgd) pressed_bars[j] = true;
  });


});




//**************
// Functions
//**************

/**
* Disables a button, changing its aspect and disabling the click
* @param btn_mask The div mask container for the true button
*/
function disable_button(btn_mask) {
  //Change the aspect class, and disables the button
  btn_mask.classList.remove("button-mask");
  btn_mask.classList.add("button-mask-disabled");
  
  btn_mask.querySelector("input").disabled= true;
}


/**
* Enables a button, changing its aspect and enabling the click
* @param btn_mask The div mask container for the true button
*/
function enable_button(btn_mask) {
  //Change the aspect class, and enables the button
  btn_mask.classList.remove("button-mask-disabled");
  btn_mask.classList.add("button-mask");
  
  btn_mask.querySelector("input").disabled= false;
}



/**
* Draws the logo with a degree of opacity over the base image
* @param l_img The logo image
*/
function draw_logo(l_img) {
    //Width and height of LOGO image
    var w= l_img.width; var h= l_img.height;
    
    //Set the hidden canvas logo
    cnv_logo.width= w; cnv_logo.height= h;
    ctx_logo.drawImage(l_img,0,0);
    
    // Make transparent the canvas manipulating each pixel with the "data" property
    var logo_data= ctx_logo.getImageData(0,0,w,h);
    var data= logo_data.data;
    for(var i=3; i<data.length; i+=4) {
      data[i]= Math.round(255* obj_logo["opacity"]);
    }
    logo_data.data = data;
    ctx_logo.putImageData(logo_data,0,0);
    
    //Draw the logo on the original context
    ctx.drawImage(cnv_logo, obj_logo["posX"]*W, obj_logo["posY"]*H, obj_logo["scale"]*W, obj_logo["scale"]*W *h/w );
}




/**
 * Moves the circle marker within an interval bar, and sets the reletive level (lvl in [0:1]) according to its position
 * @param marker A DOM object within the interval bar, representing the circle mark
 * @param x The "x" coordinate where the mark must be moved
 * @param j The bar index whose level will be changed
 */
function move_marker(marker, x, j) {
    var rect = marker.getBoundingClientRect();
    var d_circ= rect.width; //Diameter of circle
    var i_bar= marker.parentNode; //Interval bar
    var L= i_bar.offsetWidth - d_circ; //Length of bar
    
    //Left X coordinate for the circle
    var markX = x - i_bar.style.left - 0.8*d_circ;
    markX= (markX<0)? 0: markX;
    markX= (markX>L)? L: markX;
    
    //Move the circle marker
    marker.style.left = markX + "px";

    //Set the corresponding obj_logo property with the percentage
    if(j!=-1) obj_logo[prms[j]]= markX/L;
}



/**
 * Set to false the first true entry from "pressed_bars" array (if there's one), and dispatch the change in "logo_btn" to upload the canvas
 */

function unpress_bar() {
  var j= pressed_bars.findIndex((elem) => elem);
  if(j!=-1) {
    logo_btn.dispatchEvent(new Event("change"));
    pressed_bars[j] = false;
  }
}








