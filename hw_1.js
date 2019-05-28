function main() 
{
    document.getElementById('upload').addEventListener('change', readSingleFile, false);
	// Retrieve <canvas> element
	var canvas = document.getElementById('webgl');

	// Get the rendering context for WebGL
	var gl = WebGLUtils.setupWebGL(canvas);
	
	//Check that the return value is not null.
	if (!gl) 
	{
		console.log('Failed to get the rendering context for WebGL');
		return;
	}
	
	// Initialize shaders
	program = initShaders(gl, "vshader", "fshader");
	gl.useProgram(program);

    //Set up the viewport from file
    gl.viewport( 0, 0, canvas.width, canvas.height );

    var viewportPoints = [];
    var index = [];
    var points = [];
    var lineNum = 0;


	/********************** process and store uploaded files **********************/
    var file = document.getElementById("upload").files[0];
    var reader = new FileReader();
    reader.onload = function(e){
        // Entire file
        console.log(this.result);

        // By lines
        var lines = this.result.split('\n');
        if (lines[1].indexOf('*') >= 0){
            lines = lines.slice(2);
        }

        if (lines[0].split(' ').length == 4){
            viewportPoints = getViewport(lines[0]);
            lines = lines.slice(1);
        }
        lineNum = parseInt(lines[0]);
        for (var i = 1; i < lines.length; i++){
            var nums = lines.split(' ');
            if (nums.length == 1){
                index.push(parseInt(nums[0]));
            }
            else{
                for (var j = 0; j < nums.length; j++){
                    points.push(vec4(parseInt(nums[0]), parseInt(nums[1]), 0.0, 1.0));
                }
            }

        }
    };
    reader.readAsText(file);

    // Define the positions of our points
    var points = [];
    points.push(vec4(0.5, -0.5, 0.0, 1.0));
    points.push(vec4(-0.5, -0.5, 0.0, 1.0));
    points.push(vec4(0.0, 0.5, 0.0, 1.0));

    var pBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
    
    var vPosition = gl.getAttribLocation(program,  "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    //Define the colors of our points
    var colors = [];
    colors.push(vec4(1.0, 0.0, 0.0, 1.0));
    colors.push(vec4(0.0, 1.0, 0.0, 1.0));
    colors.push(vec4(0.0, 0.0, 1.0, 1.0));

    
    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
    
    var vColor = gl.getAttribLocation(program,  "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);
    
	// Set clear color
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

	// Clear <canvas> by clearning the color buffer
	gl.clear(gl.COLOR_BUFFER_BIT);
	
	// Draw a point
	gl.drawArrays(gl.LINE_STRIP, 0, points.length);
}

function getViewport(line) {
    var ports = line.split(' ');
    return [0, 0, 1, 1];
}

function readSingleFile(e) {
    var file = e.target.files[0];
    if (!file) {
        return;
    }
    var reader = new FileReader();
    reader.onload = function(e) {
        var contents = e.target.result;
        // Display file content
        return contents;
    };
    reader.readAsText(file);
}
