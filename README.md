# offline-pdf-markup
offline-pdf-markup DEMO: https://wallabyway.github.io/offline-pdf-markup/

Blog post:  https://forge.autodesk.com/blog/fast-pdf-viewingmarkup-inside-forge-viewer

![faster-pdf-big](https://user-images.githubusercontent.com/440241/48883927-01dfdd00-edd7-11e8-8afc-21dc7c4ca5a3.gif)




# UPDATE:

### How to add your SVG Logo to your 2D Sheet

"how do I add custom SVG to my 2D drawings?".  
Well, I'm glad you asked. Here's how to do it...

Say you have this as your logo...

<img width="204" alt="logo-svg" src="https://user-images.githubusercontent.com/440241/52185156-4e3d9500-27ea-11e9-8286-33471742a637.png">

The SVG for it, looks something like this...

```
<?xml version="1.0" standalone="no"?>
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" >
  <rect x="0" y="0" width="210" height="210" stroke="black" fill="transparent" stroke-width="5"/>
  <rect x="60" y="10" rx="10" ry="10" width="30" height="30" stroke="black" fill="transparent" stroke-width="5"/>
  <circle cx="25" cy="75" r="20" stroke="red" fill="transparent" stroke-width="5"/>
  <ellipse cx="75" cy="75" rx="20" ry="5" stroke="red" fill="transparent" stroke-width="5"/>

  <line x1="10" x2="50" y1="110" y2="150" stroke="orange" stroke-width="5"/>
  <polyline points="60 110 65 120 70 115 75 130 80 125 85 140 90 135 95 150 100 145"
      stroke="orange" fill="transparent" stroke-width="5"/>

  <polygon points="50 160 55 180 70 180 60 190 65 205 50 195 35 205 40 190 30 180 45 180"
      stroke="green" fill="transparent" stroke-width="5"/>

  <path d="M20,230 Q40,205 50,230 T90,230" fill="none" stroke="blue" stroke-width="5"/>
</svg>
```

We want to add this logo to a 2D sheet, in the bottom right hand corner, like this...

![withstamp](https://user-images.githubusercontent.com/440241/52185139-28b08b80-27ea-11e9-902f-92e78562020b.jpg)


To do this, we need to modify our SVG a little bit.  We need to take out the style parameters (which are ignored) and wrap the SVG code in a <g> (an SVG group primitive), like this example:

`<g transform="translate(3024 2160) scale(-2 -2)">`

This let's me position and scale my logo on page.  To position it in the bottom corner, I'll need the 2D sheet boundaries, provided by Forge-Viewer, like this...

```
var bounds = viewer.impl.model.getData().bbox.max;
 > Z.Vector3 {x: 3024, y: 2160, z: 0}
```

The markup extension already handles SVG vectors natively, so now let's add our new logo as a markup layer called 'LogoLayer', with this code:

```
var markup = viewer.getExtension("Autodesk.Viewing.MarkupsCore");
markup.enterEditMode(); 
markup.leaveEditMode();
markup.loadMarkups(_markupdata, 'LogoLayer')        
```


Fire up the browser, and you should now see the SVG logo appear on the page.  I positioned my logo with the bounds information from above, and rotated my logo to give it a bit of style, like this:

```
<g transform="rotate(3) translate(${bounds.x-700} ${490}) scale(${scale} -${scale})">
```

That's it!  You can try the demo here: DEMO

and the source code here:  GITHUB


Remember to follow me on twitter here:  @micbeale