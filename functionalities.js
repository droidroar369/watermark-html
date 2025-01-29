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
var opacity= 25; //Percentage
var scale=0.3; // 1=actual size of logo

//**************
// LISTENERS
//**************


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

          // Draw the horizontal green line
          //ctx.strokeStyle = 'green';
          //ctx.lineWidth = 5;
          //ctx.beginPath();
          //ctx.moveTo(0, img.height / 2);
          //ctx.lineTo(img.width, img.height / 2);
          //ctx.stroke();
      };
      img.src = e.target.result;
  };
  reader.readAsDataURL(file);

  enable_button(logo_btn.parentNode);
  //enable_button(dwnl_btn.parentNode);
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
  

  //When the logo file is loaded, we follow with the algorithm
  const reader = new FileReader();
  
  reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
          //Width and height of LOGO image
          var w=img.width; var h=img.height;
          
          //Set the hidden canvas logo
          cnv_logo.width= w; cnv_logo.height= h;
          ctx_logo.drawImage(img,0,0);

          // Make transparent the canvas manipulating each pixel with the "data" property
          var logo_data= ctx_logo.getImageData(0,0,w,h);
          var data= logo_data.data;
          for(var i=3; i<data.length; i+=4) {
            data[i]= Math.round(255* opacity/100);
          }
          logo_data.data = data;
          ctx_logo.putImageData(logo_data,0,0);

          //Draw the logo on the original context
          ctx.drawImage(cnv_logo, (0.5-0.15)*W, (0.5-0.15)*H, scale*W, scale*W *h/w );
      };
      img.src = e.target.result;
  };
  reader.readAsDataURL(file);

  enable_button(dwnl_btn.parentNode);
  logo_chrgd= true;
});



//Prevent logo click if image is not charged
logo_btn.addEventListener('click', (ev) => {
  if(!img_chrgd) { ev.preventDefault(); return; }
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
            
            //Download image
            link.download = `${f_nm}_mod.${extnsn}`;
            link.href = cnv.toDataURL(`image/${extnsn}`);
            link.click();
});




//**************
// Functions
//**************

/**
* Disables a button, changing its aspect and disabling the click
* @param btn_mask: The div mask container for the true button
*/
function disable_button(btn_mask) {
  //Change the aspect class, and disables the button
  btn_mask.classList.remove("button-mask");
  btn_mask.classList.add("button-mask-disabled");
  
  btn_mask.querySelector("input").disabled= true;
}


/**
* Enables a button, changing its aspect and enabling the click
* @param btn_mask: The div mask container for the true button
*/
function enable_button(btn_mask) {
  //Change the aspect class, and enables the button
  btn_mask.classList.remove("button-mask-disabled");
  btn_mask.classList.add("button-mask");
  
  btn_mask.querySelector("input").disabled= false;
}


















