//定义两个全局变量
//顶点着色器
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n'+     //声明了一个attribute变量（存储限定符）， attribute变量必须声明为全局变量， 数据从着色器外部传给该变量
    'uniform mat4 u_xformMatrix;' +     //注意把矩阵定义为mat4的类型
    'void main() {\n' +
    '  gl_Position = u_xformMatrix*a_Position;\n' + // Set the vertex coordinates of the point； 将声明的变量赋值给gl_position
    '  gl_PointSize = 10.0;\n' +                    // Set the point size
    '}\n';

//片元着色器
var FSHADER_SOURCE =
    'void main() {\n' +
    '  gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);\n' + // Set the point color
    '}\n';


//DrawRectangle.js （JavaScript脚本执行文件）
function main() {
    //获取canvas元素
    var canvas = document.getElementById('webgl');
    //如果执行结果为假， 就会执行下面的语句
    if (!canvas){
        console.log("Failed to retrieve the <canvas> element!");
        //直接退出
        return ;
    }
    //获取WebGL绘图上下文。
    var gl = getWebGLContext(canvas);


    //如果浏览器不支持WebGL则提示错误。
    if (!gl) {
        console.log("Failed to get the rendering context for WebGL.");
        return;
    }



    // Initialize shaders(指定渲染上下文， 顶点着色器， 片元着色器)
    // 注意着色器是运行在WEBGL系统中， 而不是在JavaScript中的
    //在这里完成着色器的初始化操作
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    // 设置顶点信息（颜色和位置信息）
    var n = initVertexBuffers(gl);
    if (n < 0) {
        console.log('Failed to set the vertex information');
        return;
    }


    var u_xformMatrix = gl.getUniformLocation(gl.program, 'u_xformMatrix');
    if (!u_xformMatrix){
        console.log('Failed to get the location of u_xformMatrix');
        return ;
    }

    //创建一个旋转矩阵
    var xformMatrix = new Matrix4();
    //将xformMatrix设置为旋转矩阵
    //xformMatrix.setRotate(90, 0, 0, 1);
    xformMatrix.setScale(0.3, 0.3, 1.0);
    xformMatrix.translate(-2.0, 0.0, -1.0);
    //将旋转矩阵传给顶点着色器,xformMatrix.elements是访问存储矩阵元素的类型化数组
    gl.uniformMatrix4fv(u_xformMatrix, false, xformMatrix.elements);


    //方法一：通过获取的额attribute变量的地址将顶点位置传输给attribute变量（X,Y,z），这种方法会自动将第四个参数设置为1.0（VEC4）
    //gl.vertexAttrib3f(a_Position, 0.0, 0.0, 0.0);


    //指定清除颜色缓冲区的颜色。(WEBGL中秦空绘图区之前得先指定背景颜色)(设定canvas的背景色)
    gl.clearColor(1,1,0,1);
    //用指定的颜色清除颜色缓冲区（之前指定的颜色清空）
    gl.clear(gl.COLOR_BUFFER_BIT);


    // Draw a point（绘制一个点， 从第一个顶点开始绘制， 指定绘制的顶点数量为1）
    // 绘制的过程中， 顶点着色器会执行一次（顶点着色器每一次会绘制一个顶点）
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);


    xformMatrix.setScale(0.3, 0.3, 1.0);
    xformMatrix.translate(2.0, 0.0, -1.0);
    //将旋转矩阵传给顶点着色器,xformMatrix.elements是访问存储矩阵元素的类型化数组
    gl.uniformMatrix4fv(u_xformMatrix, false, xformMatrix.elements);

    // Draw a point（绘制一个点， 从第一个顶点开始绘制， 指定绘制的顶点数量为1）
    // 绘制的过程中， 顶点着色器会执行一次（顶点着色器每一次会绘制一个顶点）
    gl.drawArrays(gl.TRIANGLE_STRIP, 1, 3);
}

//在这里来实现我的绘图操作
function initVertexBuffers(gl) {
    //新建一个类型化数组，存储顶点信息或者颜色信息（不支持push()和pop()方法）
    //vec4 a_Position 总共需要四个分量，其他两个分量就是:z,w 默认为0 1
    var vertices = new Float32Array([
        0.0,  1.0,  0.0,
        -1.0, -1.0,  0.0,
        1.0, -1.0,  0.0
    ]);

    //把数组修改成一个矩形的顶点坐标
    vertices = new Float32Array([
        1.0,  1.0,  0.0,
        -1.0,  1.0,  0.0,
        1.0, -1.0,  0.0,
        -1.0, -1.0,  0.0
    ]);



    //设置点的个数
    var n = vertices.length;

    //计算数组中每个元素所占的字节数
    //var size = vertices.BYTES_PER_ELEMENT;
    //类型化数组长度
    //var length = vertices.length;

    //1.创建缓冲区对象
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer){
        //如果发生错误
        console.log('Failed to create the buffer object');
        return -1;
    }

    //2.将缓冲区对象绑定到目标
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    //3.向缓冲区对象中写入数据
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    //获取attribute变量的存储位置（从而通过这个地址向变量传输数据）
    //gl.program 是一个程序对象， 包括了顶点着色器和片元着色器， 第二个参数是要获取存储地址的attribute的变量的名称
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    //如果指定的attribute变量不存在（不能有gl_ 或webgl_前缀）
    if (a_Position < 0){
        console.log('Failed to grt the storage location of a_Position');
        return ;
    }


    //4.将缓冲区对象分配给a_Position变量（将缓冲区对象的引用或指针分配给attribute变量）
    /*
    * @location: attribute's location
    * @size: 每个顶点的分量个数
    * @type: 浮点型
    * @strida: 相邻两个顶点的字节数
    * @offset:缓冲区对象的偏移量
    * */
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);

    //5.连接a_Position变量与分配给他的缓冲区对象（处理的对象是缓冲区）
    gl.enableVertexAttribArray(a_Position);

    return n;
}
