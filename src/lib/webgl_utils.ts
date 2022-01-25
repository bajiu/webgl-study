/**
 * 公用方法集合
 */

export const initVertexBuffer = (gl: WebGLRenderingContext, vertices: Float32Array) => {
  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)
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

export const draw = (gl: WebGLRenderingContext, size: number) => {
  gl.drawArrays(gl.TRIANGLES, 0, size)
}
