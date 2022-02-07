/**
 * 公用方法集合
 */

export const initVertexBuffer = (gl: WebGLRenderingContext, vertices: Float32Array) => {
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)
    return buffer
}

export const initSizeBuffer = (gl: WebGLRenderingContext, sizes: number) => {
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, sizes, gl.STATIC_DRAW)
}

export const setAttributeFromBuffer = (gl: any, name: any, size = 2, stride = 0, offset = 0) => {
    const attribute: GLint = gl.getAttribLocation(gl.program, name)
    gl.vertexAttribPointer(attribute, size, gl.FLOAT, false, stride, offset)
    gl.enableVertexAttribArray(attribute)
}

export const setAttrFromBuffer = (gl: any, program: any, name: any, size = 2, stride = 0, offset = 0) => {
    const attribute: GLint = gl.getAttribLocation(program, name)
    gl.vertexAttribPointer(attribute, size, gl.FLOAT, false, stride, offset)
    gl.enableVertexAttribArray(attribute)
}

// export const draw = (gl: WebGLRenderingContext, size: number) => {
//     gl.drawArrays(gl.TRIANGLES, 0, size)
// }

/**
 * 创建webgl
 * @param width
 * @param height
 */
export const createGl = (width = 512, height = 512) => {
    const canvas = document.createElement('canvas')
    const gl: WebGL2RenderingContext = canvas.getContext("webgl2") as WebGL2RenderingContext
    const dpr = window.devicePixelRatio || 1
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    canvas.width = dpr * width
    canvas.height = dpr * height
    gl.viewport(0, 0, canvas.width, canvas.height)
    document.body.append(canvas)
    return gl
}

//向顶点缓冲区写入数据，留待以后分配
export function initArrayBufferForLaterUse(gl:any, data:any, num:any, type:any) {
    // Create a buffer object
    var buffer = gl.createBuffer();
    if (!buffer) {
        console.log('Failed to create the buffer object');
        return null;
    }
    // Write date into the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    // Store the necessary information to assign the object to the attribute variable later
    buffer.num = num;
    buffer.type = type;

    return buffer;
}

//分配缓冲区对象并开启连接
export function initAttributeVariable(gl: { bindBuffer: (arg0: any, arg1: any) => void; ARRAY_BUFFER: any; vertexAttribPointer: (arg0: any, arg1: any, arg2: any, arg3: boolean, arg4: number, arg5: number) => void; enableVertexAttribArray: (arg0: any) => void }, a_attribute: any, buffer: { num: any; type: any }) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(a_attribute, buffer.num, buffer.type, false, 0, 0);
    gl.enableVertexAttribArray(a_attribute);
}

export //向顶点缓冲区写入索引，留待以后分配
function initElementArrayBufferForLaterUse(gl: { createBuffer: () => any; bindBuffer: (arg0: any, arg1: any) => void; ELEMENT_ARRAY_BUFFER: any; bufferData: (arg0: any, arg1: any, arg2: any) => void; STATIC_DRAW: any }, data: any, type: any) {
    // Create a buffer object
    var buffer = gl.createBuffer();
    if (!buffer) {
        console.log('Failed to create the buffer object');
        return null;
    }
    // Write date into the buffer object
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);

    buffer.type = type;

    return buffer;
}
