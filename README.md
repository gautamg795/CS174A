### Assignment 3
#### CS174A - Spring '15 - Prof. Friedman
* * * 
#### Project Requirements - Implemented
1. >Implement assignment cleanly/legibly with code comments and readme.

	See README.md
2. >Implement functionality to load two square images (of your choice) into texture maps. You must include whatever files are needed for us to run your code (images, etc)

	This has been done. The two image files have been included.

3. >Apply the entire first texture onto each face of a cube that has a size of your choosing. That is, the texture coordinates should range from (0,1) in both the s and t dimensions.

	On the first cube, I use the texture coordinates around the square from (0,0) to (1,1) as required.

4. >Create a second cube where the second image texture is again applied to each face and is zoomed out by 50% (the image should shrink). Furthermore, texture coordinates should be set such that the aspect ratio of the image is maintained on the face of the cube

	I pushed different texture coordinates for this cube, from (0,0) to (2,2) to scale the cube down. The length and width are both reduced by 50%, so the total area is reduced to 25%. The aspect ratio is maintained.

5. >Implement Mip Mapping for the zoomed texture (in #4) using tri-linear filtering. Filtering for the non-zoomed texture (in #3) should use nearest neighbor 

	A call to `gl.generateMipmap` does what is required. For the min/mag filters on the first cube, I used `gl.NEAREST`, and for the second cube I used `gl.LINEAR_MIPMAP_LINEAR`. 

6. >Position both cubes within the view of your starting camera view – the positions of the cubes, their position relative to the camera and the FOV of the camera are up to you.

	Both cubes are visible upon loading the page. 

7. >Define two keys ‘i’ and ‘o’ that move the camera nearer or farer away from the cubes so we can see the effect of the texture filtering as they get smaller or larger

	I bound event listeners to the keys so that `i` moves the camera in and `o` moves the camera out by altering the z-component of the view matrix. 



#### Project Requirements - Not Implemented
All requirements were implemented.

#### Extra Credit (Implemented)
1. >Use the key ‘r’ to start and stop the rotation both cubes. Cube from step #3 should rotate around the cube’s Y-axis at a rate of 10 rpm and the cube from step #4 should rotate at half this rate (5 rpm) around that cube’s X-axis.

	Done; both cubes rotate; Cube one rotates one degree per frame, which at 60fps gives 10rpm. The second cube rotates at .5 degrees per frame, giving 5rpm.

2. >Use the ‘t’ key to start and stop the rotation of the texture maps themselves on all faces of the cube from step #3 around the center of each face at a rate of 15 rpm

	I rotate the texture maps around their center for each face, increasing the theta of rotation by 1.5 degrees per frame (giving 15 rpm). This is done in the shader itself.  

3. >Use the ‘s’ key to start and stop the continuous scrolling the texture map on the cube from step #4 in a direction and speed of your choosing (as long as its slow enough to see) across the each face of the cube. You will need to select a texture wrap mode so that the image repeats.

	I added in an offset that is incremented every frame. This is used to translate the texture map, giving the appearance of sliding. I reset this whenever the offset is more than +1, as the range of texture coordinates is [0, 1]. 

