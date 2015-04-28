### Assignment 2
#### CS174A - Spring '15 - Prof. Friedman
* * * 
#### Project Requirements - Implemented
1. >Implement assignment cleanly/legibly with code comments and readme.

	See README.md
2. >Setup WebGL capable HTML canvas with size 960x540 with z-buffer enable and cleared to black background.
Implement necessary shaders without error.

	A `<canvas>` element with the correct size is in the HTML document. `gl.enable(gl.DEPTH_TEST)` and `gl.clearColor()` were used to set up the canvas as required.

3. >Develop a function to generate sphere geometry. Use a parameter to define the number of vertices to create the sphere.

	I made a function called `sphere(nSub)` that uses the code from the textbook to recursively create a sphere that has been subdivided from a tetrahedron `nsub` times. 

4. >Extend the sphere function to generate normal vectors for shading. A function parameter should specify whether to generate norma vectors for flat or smooth shading.5. 

	I extended the `triangle()` subfunction in `sphere()` to check what kind of normals the shading method requires. The code snippets for generating the different normals are also taken from the textbook.

5. >Create a small solar system - one sun with 4 orbiting planets. Choose a location other than the origin for the sun, and diameter of the sun, radius of each planet, and planet size and orbit rate. 

	I have a sun with 4 planets orbiting it. They all rotate at different rates (`2 / radius * 4` degrees per frame). 

6. >Implement a point light source at the locaiton of the sun. The sun's size should determine the color. Use this for the light source and the geometry. First, icy white faceted, diamond-like planet with medium-low complexity, flat shaded. Second; swampty, water-green planet with medium-low complexity, Gouraud shaded with specular highlight. Third; planet covered in smooth water with high complexity, Phong shaded with specular highlight. Fourth; mud-covered brownish-orange planet with dull appearance with medium-high complexity and no specular highlight.

	To accomplish this I gave each Planet object a material with the specular, ambient, and diffuse properties. The sunlight also had these three properties. I also passed in a 'shading method' variable during the creating of each planet. This method was also sent to the vertex/fragment shaders to conditionally use different shading methods. (Unfortunately, branching in the shaders kills performance, but it's probably okay for this project. Use different shader programs in the future.) For the sun, I also passed in a boolean/integer flag 'isSun' to color the sun directly without shading. 

	The planets were arranged in the specified order from inside to out.

7. >Implement appropriate shading in the CPU/GPU as necessary.

	I followed the book's example for the most part. All lighting products are computed on the CPU in the Javascript and are computed per planet, as they are the same for a certain material. Normals are computed per vertex or per primitive as per the chosen shading method. The actual lighting computations and multiplies are performed on GPU in the vertex/fragment shader for Gouraud and Phong-Blinn shading. Computation of the model-view matrix and projection matrix is done in the CPU, but the actual product is computed on the GPU as their separate components are needed for lighting. 
	
8. >Implement (re-use) keyboard navigation from Assignment #1. Initial view should be looking at the center of the solar system, looking down at 30 degrees.

	Keys work as they did in Assignment 1, without `+` for the crosshair. `a` also allows attachment to the outer planet (see Extra Credit #2).





#### Project Requirements - Not Implemented
All requirements were implemented.

#### Extra Credit (Implemented)
1. >Add a moon orbiting around one of the planets.
	There is a moon orbiting around the outermost planet. 

2. >Define and document a key, of your choice, that will allow the camera to attach/detach to an orbiting planet. While attached allow only heading to be changed interactively so you can look at other planets.

	When pressing the `a` key, you are attached to the outermost planet, looking initially at the sun. You may use the left and right arrow keys as before. I implemented this by using lookAt to ease keeping the view centered on the sun and varying the 'at' point with rotations. 

3. >Manage code development and submission on the GitHub repository

	Yes.

4. >Early submission using GitHub

	This repository was last updated and tagged on Monday, April 27.

