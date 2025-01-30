var pressed=false;

/**
*This function returns a (R,G,B) value, equivalent to that of the obtained in the linear-gradient CSS function at a "t" percentaje
@args
colors: an array list of the colors of the gradient, in (r,g,b) format
t: real number in [0,100%] range
stops: a list of the percentaje stops. If empty, the stops are equidistant
*/
function gradient_color(colors, t, stops=[]) {
  var stps=[];
  
  if(stops.length==0) {
    var L = colors.length-1;
    for(var k=0; k<L+1; k++) stps.push(k*100.0/L);
  }
  else stps = stops;
  
  var k=0;
  while(t>=stps[k] && k<=L) k++;
  if(k==L+1) k--;
  
  return [Math.round(colors[k-1][0]+ (colors[k][0]-colors[k-1][0])*(t-stps[k-1])/(stps[k]-stps[k-1]) ), Math.round(colors[k-1][1]+ (colors[k][1]-colors[k-1][1])*(t-stps[k-1])/(stps[k]-stps[k-1]) ), Math.round(colors[k-1][2]+ (colors[k][2]-colors[k-1][2])*(t-stps[k-1])/(stps[k]-stps[k-1]) )];  
}

//console.log(gradient_color([[255,0,0], [0,255,0]], 0));

document.addEventListener('mouseup', function(evt) {
      pressed = false;
});

document.querySelectorAll('.hue-selector').forEach(function(hue_bar) {
    var list_colors=[[255,0,0], [255,255,0], [0,255,0], [0,255,255], [0,0,255], [255,0,255], [255,0,0]];
    
    hue_bar.addEventListener('click', function(evt) {
        var marker = this.querySelector('.circle-marker');
        var rect = marker.getBoundingClientRect();
        
        var offsetX = evt.clientX - this.style.left - 0.8*rect.width;
        marker.style.left = offsetX + "px";
        paint_cuadro( gradient_color(list_colors, 100*(offsetX+0.5*rect.width)/this.offsetWidth) );
        //console.log(100*(offsetX+0.5*rect.width)/this.offsetWidth);
    });
    
    //var pressed=false;
    hue_bar.addEventListener('mousedown', function(evt) {
      pressed = true;
    });
    
    /*hue_bar.addEventListener('mouseleave', function(evt) {
      pressed = false;
    });*/
    
    hue_bar.addEventListener('mousemove', function(evt) {
     if(pressed) {
        var marker = this.querySelector('.circle-marker');
        var rect = marker.getBoundingClientRect();
        
        var offsetX = evt.clientX - this.style.left - 0.8*rect.width;
        marker.style.left = offsetX + "px";
      }
    });
});


function paint_cuadro(hue_color) {
  var cuadr=document.getElementById('cuadro1');
  cuadr.style.background = "rgb("+ hue_color[0] +","+ hue_color[1]+ ","+ hue_color[2]+ ")";
  
}

















