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
    const gl: WebGLRenderingContext = canvas.getContext("webgl2") as WebGLRenderingContext
    const dpr = window.devicePixelRatio || 1
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    canvas.width = dpr * width
    canvas.height = dpr * height
    gl?.viewport(0, 0, canvas.width, canvas.height)
    document.body.append(canvas)
    return gl
}
