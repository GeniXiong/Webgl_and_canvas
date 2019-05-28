
function main() {
    const inputElement = document.getElementById("upload");
    inputElement.addEventListener("change", handleFiles, false);
    document.addEventListener('keydown', mode);

}

function mode(e) {
    if (e.key == "d" || e.key == "D"){
        window.location.href = "draw.html";
    }

}

function handleFiles() {
    /* get file from uploading */
    if (document.getElementById('upload').files.length > 0){
        var file = document.getElementById('upload').files[0];
        var reader = new FileReader();
        reader.onload = function(evt) {
            var contents = evt.target.result;
            var result = parseFile(contents);

            drawImage(result.points, result.index);

            display(result.points, result.index);
        };
        reader.readAsText(file);
    }
}

function display(points, index){
    var text = "start";
    var start = 0;
    for(var i = 0; i < index.length; i++){
        text = text + "number" + index[i] + " :";
        text = text + "from: " + points[start] + " to: " + points[start + index[i] - 1];
        start = start + index[i];
    }


    document.getElementById('content').innerText = text;
}

function parseFile(f) {
    var viewportString = "";
    var points = [];
    var index = [];
    var lineNumber;

    var lines = f.split('\n');

    /* if the file is not dino */
    if (f.includes("*")){
        /* the file scene contains many empty lines */
        if (f.includes('scene')){
            viewportString = lines[4];
            lineNumber = parseInt(lines[6]);
            lines = lines.slice(7);
        }
        /* other normal files */
        else {
            viewportString = lines[2];
            lineNumber = parseInt(lines[3]);
            lines = lines.slice(4);
        }

        /*scale the x, y coordinates according to content extend */
        var view = parseViewport(viewportString);


        for(var i = 0; i < lines.length; i++){
            if(lines[i].length > 0) {
                var line = lines[i].trim();
                var nums = line.split(/[\s,]+/);
                if (nums.length == 2) {
                    points.push(vec4((parseFloat(nums[0]) - view.dx) * view.scale, (parseFloat(nums[1]) - view.dy) * view.scale, 0.0, 1.0));
                }
                if (line.length > 0 && nums.length == 1) {
                    index.push(parseInt(nums[0]));
                }
            }

        }
    }
    /* if the file contains no * it means it's a dino file
    * parse the x, y coordinates and scale it to 640 * 480 */
    else{
        lineNumber = parseInt(lines[0]);
        lines = lines.slice(1);

        for (var i = 0; i < lines.length; i++){
            var line = lines[i].trim();
            var nums = line.split(/[\s,]+/);
            if (nums.length == 2) {
                points.push(vec4(parseFloat(nums[0])/330 - 1, parseFloat(nums[1])/440 - 1, 0.0, 1.0));
                // points.push(vec4((parseFloat(nums[0]) - 0.5) * 2, (parseFloat(nums[1]) - 0.5) * 2, 0.0, 1.0));
            }
            if (line.length > 0 && nums.length == 1) {
                index.push(parseInt(nums[0]));
            }
        }
    }

    return {
        points: points,
        index: index,
        lineNumber: lineNumber
    };
}

function parseViewport(line) {
    line = line.trim();
    var nums = line.split(/[\s,]+/);
    var scale = 1;
    var dw = parseFloat(nums[2]) - parseFloat(nums[0]);
    var dh = parseFloat(nums[1]) - parseFloat(nums[3]);
    scale = Math.min(2/dw, 2/dh);

    return {
        dx: (parseFloat(nums[2]) + parseFloat(nums[0]))/2,
        dy: (parseFloat(nums[1]) + parseFloat(nums[3]))/2,
        scale: scale
    };
}

function drawImage(points, index) {
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

    //Set up the viewport
    gl.viewport( 0, 0, canvas.width, canvas.height);

    var pBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program,  "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    //Define the colors of our points
    var colors = [];
    for (var i = 0; i < points.length; i++){
        colors.push(vec4(0.0, 0.0, 0.0, 1.0));
    }

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

    // Draw a lines
    var start = 0;
    for (var i = 0; i < index.length; i++){
        gl.drawArrays(gl.LINE_STRIP, start, index[i]);
        start = start + index[i];
    }
}
