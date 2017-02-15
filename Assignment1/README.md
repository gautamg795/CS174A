### Assignment 1
#### CS174A - Spring '15 - Prof. Friedman
* * * 
#### Project Requirements - Implemented
1. >Implement assignment cleanly/legibly with code comments and readme.

	See README.md
2. >Setup WebGL capable HTML canvas with size 960x540 with z-buffer enable and cleared to black background.
Implement necessary shaders without error.

	A `<canvas>` element with the correct size is in the HTML document. `gl.enable(gl.DEPTH_TEST)` and `gl.clearColor()` were used to set up the canvas as required.

3. >Display 8 cubes using perspective projection at (±10, ±10, ±10) from the origin in different colors.
Outline the edges in white. The `c` character should cycle colors between the cubes. Cubes should display in square aspect ratio.
All 8 cubes should be visible from camera's initial position.

	See extra credit #1, but I create eight instances of a cube and translated each to the correct position. I used an array of colors and picked an element from the array for each cube, and cycled the index into that array every time `c` was pressed. I used a perspective projection matrix to ensure that cubes are displayed in square aspect ratio, and translated the world on the negative Z axis to ensure that all cubes are visible.

4. >Implement camera navigation with keyboard. Up/down arrow keys control position along y-axis, left/right arrow keys control heading.
`i`, `j`, `k`, and `m` control forward, left, right, and backward respectively, relative to the current heading.
Key presses move 1 degree or 0.25 units as appropriate. X-Z plane translation is relative to the current heading.

	I used `window.onkeypress` to set up handlers for this (and the other keyboard events). I changed the x/y/z coordinates for the camera's translation matrix (the view matrix) but used sine and cosine of the current heading to calculate which component of motion is along which axis. This ensures that translation is relative to the current heading.

5. >`n` and `w` keys make the horizontal field of view narrower and wider respectively. The aspect ratio does not change. `+` toggles an orthographic projection of crosshairs centered on the scene.

	In order to make sure that `n` and `w` changed the *horizontal* field of view by one degree, I had to use the relation `fovy = (2 * Math.atan(Math.tan(radians(fovx) / 2) * (1 / aspect))) * 180 / Math.PI` as the `perspective()` function from MV.js only generates matrices based off the vertical field of view. However, I then realized that when using the `perspective()` function, this simplifies to simply `fovy = fovx / aspect`.

	To generate the crosshairs, I used four vertices to make two perpendicular lines around the origin. I generated an orthographic projection matrix with MV.js and placed the crosshairs at Z=0. I drew the crosshairs after all the cubes and after temporarily disabling the depth buffer to ensure that the crosshairs stay on top of the cubes.


#### Project Requirements - Not Implemented
All requirements were implemented.

#### Extra Credit (Implemented)
1. >Instance eight cubes from the same data and implement cube geometry using a single triangle strip.

	This is done in the `generateCubes()` function, where I used a single collection of vertices along with a 	specific ordering of vertices to push a single cube's worth of data to be drawn using triangle strips.In 	`render()` I instance this data by drawing the same data repeatedly then translating each cube to the 	correct poition.

2. >Smoothly, continuously, and individually rotate and scale the cubes with 60rpm rotation and scaling of ±10%. The cubes shall remain centered around their original position.

	I implemented this by passing a `theta` variable into the shader and computing a rotation matrix for each cube based on this theta around the x axis. Theta is increased by 6.0 degrees every render because the animation plays at 60 frames per second. Because I am computing `sin(theta)` and sine varies between -1 and 1, I used this same value with a scaling matrix to scale the cubes by a factor of `1 + 0.1 * sin(theta)`.


3. >Implement your camera navigation system using quaternions

	This was done for me in MV.js provided by the textbook author (the `rotate()` function which I used to generate matrices for the camera's rotation already use quaternions.) Rotations are the only navigation that can be done with quaternions.

4. >Manage code development and submission on the GitHub repository

	Yes.

5. >Early submission using GitHub

	This repository was last updated and tagged on Sunday, April 12.

